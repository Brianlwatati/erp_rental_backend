import * as repo from "../repositories/invoice.repository";
import { query, withTransaction } from "../config/database";
import { generateDocumentNumber } from "../utils/number-generator";
import type { PoolClient } from "pg";

async function verifyLeaseAndTenant(
  c: string,
  leaseId: string,
  tenantId: string,
  client: PoolClient,
) {
  const lease = (
    await client.query(
      `SELECT id, tenant_id, lease_invoice_id, deposit_amount, include_deposit_in_first_invoice
       FROM rental_leases WHERE id=$1 AND company_id=$2 FOR UPDATE`,
      [leaseId, c],
    )
  ).rows[0];
  if (!lease) throw new Error("LEASE_NOT_FOUND");
  const tenant = (
    await client.query(
      "SELECT id FROM rental_tenants WHERE id=$1 AND company_id=$2",
      [tenantId, c],
    )
  ).rows[0];
  if (!tenant) throw new Error("TENANT_NOT_FOUND");
  if (lease.tenant_id !== tenantId) throw new Error("LEASE_TENANT_MISMATCH");
  return lease;
}

export const listInvoicesNotFullyPaid = (
  c: string,
  filters: { tenantId?: string; leaseId?: string },
) => repo.findInvoicesNotFullyPaid(c, filters);

export const listInvoices = (
  c: string,
  filters: { status?: string; tenantId?: string; leaseId?: string },
) => repo.findInvoices(c, filters);

export const listInvoicesByTenant = (c: string, tenantId: string) =>
  repo.findInvoices(c, { tenantId });

export async function getInvoice(c: string, id: string) {
  const invoice = await repo.findInvoiceById(c, id);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  const items = await repo.findInvoiceItems(id);
  return { ...invoice, items };
}

export async function createInvoice(c: string, d: any) {
  return withTransaction(async (client) => {
    const lease = await verifyLeaseAndTenant(c, d.leaseId, d.tenantId, client);
    if (lease.lease_invoice_id) {
      throw new Error("LEASE_INVOICE_ALREADY_CREATED");
    }
    const previousInvoice = await client.query(
      "SELECT id FROM rental_invoices WHERE lease_id=$1 AND status <> 'CANCELLED' LIMIT 1",
      [d.leaseId],
    );
    if (previousInvoice.rowCount) {
      throw new Error("LEASE_INVOICE_ALREADY_CREATED");
    }
    const isFirstInvoice = true;
    const itemsToCreate = [...d.items];
    const hasCombinedRentAndCharges = itemsToCreate.some((item) =>
      ["RENT_PLUS_CHARGES", "RENTPLUSCHARGES"].includes(
        item.itemType.toUpperCase(),
      ),
    );
    if (!hasCombinedRentAndCharges) {
      const hasRentItem = itemsToCreate.some(
        (item) => item.itemType.toUpperCase() === "RENT",
      );
      if (!hasRentItem && Number(lease.monthly_rent) > 0) {
        itemsToCreate.push({
          description: "Monthly rent",
          itemType: "RENT",
          quantity: 1,
          unitPrice: Number(lease.monthly_rent),
        });
      }

      const charges = await client.query(
        `SELECT name, amount, recurring FROM rental_lease_charges
         WHERE lease_id=$1 AND (recurring=TRUE OR $2=TRUE)`,
        [d.leaseId, isFirstInvoice],
      );
      for (const charge of charges.rows) {
        const alreadyIncluded = itemsToCreate.some(
          (item) =>
            item.description.trim().toLowerCase() ===
            charge.name.trim().toLowerCase(),
        );
        if (!alreadyIncluded) {
          itemsToCreate.push({
            description: charge.name,
            itemType: "CHARGE",
            quantity: 1,
            unitPrice: Number(charge.amount),
          });
        }
      }
    }
    const alreadyHasDeposit = itemsToCreate.some(
      (item) => item.itemType.toUpperCase() === "DEPOSIT",
    );
    if (
      lease.include_deposit_in_first_invoice &&
      isFirstInvoice &&
      Number(lease.deposit_amount) > 0 &&
      !alreadyHasDeposit
    ) {
      itemsToCreate.push({
        description: "Security deposit",
        itemType: "DEPOSIT",
        quantity: 1,
        unitPrice: Number(lease.deposit_amount),
      });
    }
    const invoice = await repo.createInvoiceHeader(
      c,
      { ...d, invoiceNumber: d.invoiceNumber ?? generateDocumentNumber("INV") },
      client,
    );
    for (const item of itemsToCreate) {
      await repo.createInvoiceItem(invoice.id, item, client);
    }
    await client.query(
      `UPDATE rental_leases SET lease_invoice_id=$3, updated_at=NOW()
       WHERE company_id=$1 AND id=$2 AND lease_invoice_id IS NULL`,
      [c, d.leaseId, invoice.id],
    );
    const finalInvoice = await repo.recomputeInvoiceTotals(invoice.id, client);
    const items = await repo.findInvoiceItems(invoice.id, client);
    return { ...finalInvoice, items };
  });
}

export async function updateInvoice(c: string, id: string, d: any) {
  return withTransaction(async (client) => {
    const existing = await repo.findInvoiceById(c, id, client);
    if (!existing) throw new Error("INVOICE_NOT_FOUND");
    if (existing.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.updateInvoiceFields(c, id, d, client);
    const updated = await repo.recomputeInvoiceTotals(id, client);
    const items = await repo.findInvoiceItems(id, client);
    return { ...updated, items };
  });
}

export async function issueInvoice(c: string, id: string) {
  const existing = await repo.findInvoiceById(c, id);
  if (!existing) throw new Error("INVOICE_NOT_FOUND");
  if (existing.status !== "DRAFT") throw new Error("INVOICE_NOT_DRAFT");
  return repo.setInvoiceStatus(c, id, "ISSUED");
}

export async function cancelInvoice(c: string, id: string) {
  return withTransaction(async (client) => {
    const existing = await repo.findInvoiceByIdForUpdate(c, id, client);
    if (!existing) throw new Error("INVOICE_NOT_FOUND");
    if (Number(existing.amount_paid) > 0)
      throw new Error("INVOICE_HAS_PAYMENTS");
    const cancelled = await repo.setInvoiceStatus(c, id, "CANCELLED", client);
    if (!cancelled) throw new Error("INVOICE_NOT_FOUND");
    await client.query(
      `UPDATE rental_leases SET lease_invoice_id=NULL, updated_at=NOW()
       WHERE company_id=$1 AND id=$2 AND lease_invoice_id=$3`,
      [c, existing.lease_id, id],
    );
    return cancelled;
  });
}

export async function deleteInvoice(c: string, id: string) {
  const existing = await repo.findInvoiceById(c, id);
  if (!existing) throw new Error("INVOICE_NOT_FOUND");
  if (existing.status !== "DRAFT" && existing.status !== "CANCELLED")
    throw new Error("INVOICE_NOT_EDITABLE");
  const x = await repo.deleteInvoice(c, id);
  if (!x) throw new Error("INVOICE_NOT_FOUND");
  return x;
}

export async function listInvoiceItems(c: string, invoiceId: string) {
  const invoice = await repo.findInvoiceById(c, invoiceId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  return repo.findInvoiceItems(invoiceId);
}

export async function addInvoiceItem(c: string, invoiceId: string, d: any) {
  return withTransaction(async (client) => {
    const invoice = await repo.findInvoiceById(c, invoiceId, client);
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");
    if (invoice.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.createInvoiceItem(invoiceId, d, client);
    const updated = await repo.recomputeInvoiceTotals(invoiceId, client);
    const items = await repo.findInvoiceItems(invoiceId, client);
    return { ...updated, items };
  });
}

export async function deleteInvoiceItem(c: string, id: string) {
  return withTransaction(async (client) => {
    const item = await repo.findInvoiceItemById(c, id, client);
    if (!item) throw new Error("INVOICE_ITEM_NOT_FOUND");
    const invoice = await repo.findInvoiceById(c, item.invoice_id, client);
    if (invoice.status !== "DRAFT") throw new Error("INVOICE_NOT_EDITABLE");
    await repo.deleteInvoiceItemRow(id, client);
    const updated = await repo.recomputeInvoiceTotals(item.invoice_id, client);
    const items = await repo.findInvoiceItems(item.invoice_id, client);
    return { ...updated, items };
  });
}
