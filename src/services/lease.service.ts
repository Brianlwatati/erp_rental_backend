import * as repo from "../repositories/lease.repository";
import { query, withTransaction } from "../config/database";
import { reversePaymentInTransaction } from "./payment.service";
import { generateDocumentNumber } from "../utils/number-generator";

async function verifyUnit(c: string, unitId: string) {
  const r = await query(
    `SELECT u.id FROM rental_units u JOIN rental_buildings b ON b.id=u.building_id JOIN rental_properties p ON p.id=b.property_id
     WHERE u.id=$1 AND p.company_id=$2`,
    [unitId, c],
  );
  if (!r.rowCount) throw new Error("UNIT_NOT_FOUND");
}
async function verifyTenant(c: string, tenantId: string) {
  const r = await query(
    "SELECT id FROM rental_tenants WHERE id=$1 AND company_id=$2",
    [tenantId, c],
  );
  if (!r.rowCount) throw new Error("TENANT_NOT_FOUND");
}
async function setUnitStatus(unitId: string, status: string) {
  await query(
    "UPDATE rental_units SET status=$2, updated_at=NOW() WHERE id=$1",
    [unitId, status],
  );
}

export const listLeases = (
  c: string,
  filters: { status?: string; tenantId?: string; unitId?: string },
) => repo.findLeases(c, filters);

export const listLeasesByUnitId = (companyId: string, unitId: string) =>
  repo.findLeasesByUnitId(companyId, unitId);

export async function getLease(c: string, id: string) {
  const x = await repo.findLeaseById(c, id);
  if (!x) throw new Error("LEASE_NOT_FOUND");
  return x;
}
export async function createLease(c: string, d: any) {
  await verifyUnit(c, d.unitId);
  await verifyTenant(c, d.tenantId);
  const lease = await repo.createLease(c, {
    ...d,
    leaseNumber: d.leaseNumber ?? generateDocumentNumber("LSE"),
  });
  if (lease.status === "ACTIVE") await setUnitStatus(d.unitId, "OCCUPIED");
  return lease;
}
export async function updateLease(c: string, id: string, d: any) {
  const existing = await getLease(c, id);
  const x = await repo.updateLease(c, id, d);
  if (!x) throw new Error("LEASE_NOT_FOUND");
  if (d.status && d.status !== existing.status) {
    if (d.status === "ACTIVE") await setUnitStatus(x.unit_id, "OCCUPIED");
    else if (["TERMINATED", "EXPIRED"].includes(d.status))
      await setUnitStatus(x.unit_id, "VACANT");
  }
  return x;
}
export async function terminateLease(c: string, id: string, d: any) {
  return withTransaction(async (client) => {
    const lease = (
      await client.query(
        `SELECT * FROM rental_leases
         WHERE company_id=$1 AND id=$2
         FOR UPDATE`,
        [c, id],
      )
    ).rows[0];
    if (!lease) throw new Error("LEASE_NOT_FOUND");
    if (lease.status === "TERMINATED")
      throw new Error("LEASE_NOT_FOUND_OR_ALREADY_TERMINATED");

    if (d.refundable) {
      const invoices = (
        await client.query(
          `SELECT id FROM rental_invoices
           WHERE company_id=$1 AND lease_id=$2 AND status <> 'CANCELLED'
           ORDER BY id
           FOR UPDATE`,
          [c, id],
        )
      ).rows as Array<{ id: string }>;
      const invoiceIds = invoices.map((invoice) => invoice.id);

      if (invoiceIds.length) {
        const payments = (
          await client.query(
            `SELECT id FROM rental_payments
             WHERE company_id=$1
               AND id IN (
                 SELECT DISTINCT payment_id
                 FROM rental_payment_allocations
                 WHERE invoice_id=ANY($2::uuid[])
               )
             ORDER BY id
             FOR UPDATE`,
            [c, invoiceIds],
          )
        ).rows as Array<{ id: string }>;
        for (const payment of payments) {
          await reversePaymentInTransaction(c, payment.id, client);
        }

        for (const invoiceId of invoiceIds) {
          const cancelled = await client.query(
            `UPDATE rental_invoices
             SET status='CANCELLED',updated_at=NOW()
             WHERE company_id=$1 AND id=$2 AND amount_paid=0
               AND status <> 'CANCELLED'
               AND NOT EXISTS (
                 SELECT 1 FROM rental_payment_allocations a
                 WHERE a.invoice_id=rental_invoices.id
               )`,
            [c, invoiceId],
          );
          if (!cancelled.rowCount) throw new Error("INVOICE_HAS_PAYMENTS");
        }
        await client.query(
          `UPDATE rental_leases
           SET lease_invoice_id=NULL,updated_at=NOW()
           WHERE company_id=$1 AND id=$2`,
          [c, id],
        );
      }
    }

    const terminated = (
      await client.query(
        `UPDATE rental_leases
         SET status='TERMINATED',termination_date=$3,termination_reason=$4,
             updated_at=NOW()
         WHERE company_id=$1 AND id=$2 AND status <> 'TERMINATED'
         RETURNING *`,
        [c, id, d.terminationDate, d.terminationReason ?? null],
      )
    ).rows[0];
    if (!terminated) throw new Error("LEASE_NOT_FOUND_OR_ALREADY_TERMINATED");
    await client.query(
      `UPDATE rental_units SET status='VACANT',updated_at=NOW() WHERE id=$1`,
      [terminated.unit_id],
    );
    return terminated;
  });
}

export async function extendLeaseMonthNew(c: string, id: string) {
  return repo.extendLeaseMonthNew(
    c,
    id,
    generateDocumentNumber("LSE"),
  );
}

export async function extendAllLeasesForMonth(c: string, month: string) {
  return repo.extendAllLeasesForMonth(c, month, () =>
    generateDocumentNumber("LSE"),
  );
}

export async function deleteLease(c: string, id: string) {
  const x = await repo.deleteLease(c, id);
  if (!x) throw new Error("LEASE_NOT_FOUND");
  return x;
}

export async function listLeaseCharges(c: string, leaseId: string) {
  await getLease(c, leaseId);
  return repo.findLeaseCharges(c, leaseId);
}

export async function addLeaseCharge(c: string, leaseId: string, d: any) {
  await getLease(c, leaseId);
  const charge = await repo.createLeaseCharge(c, leaseId, d);
  if (!charge) throw new Error("LEASE_NOT_FOUND");
  return charge;
}
export async function deleteLeaseCharge(c: string, id: string) {
  const x = await repo.deleteLeaseCharge(c, id);
  if (!x) throw new Error("LEASE_CHARGE_NOT_FOUND");
  return x;
}
