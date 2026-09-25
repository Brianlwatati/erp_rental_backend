import { query } from "../config/database";

export async function findLeases(
  companyId: string,
  filters: { status?: string; tenantId?: string; unitId?: string },
) {
  const clauses = ["company_id=$1"];
  const params: unknown[] = [companyId];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status=$${params.length}`);
  }
  if (filters.tenantId) {
    params.push(filters.tenantId);
    clauses.push(`tenant_id=$${params.length}`);
  }
  if (filters.unitId) {
    params.push(filters.unitId);
    clauses.push(`unit_id=$${params.length}`);
  }
  return (
    await query(
      `SELECT * FROM rental_leases WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
      params,
    )
  ).rows;
}
export async function findLeaseById(companyId: string, id: string) {
  return (
    (
      await query("SELECT * FROM rental_leases WHERE company_id=$1 AND id=$2", [
        companyId,
        id,
      ])
    ).rows[0] ?? null
  );
}
export async function createLease(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_leases(company_id,unit_id,unit_number,building_id,building_name,building_code,property_name,property_code,tenant_id,lease_number,start_date,end_date,monthly_rent,deposit_amount,billing_day,status,notes)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,COALESCE($16,'ACTIVE'),$17) RETURNING *`,
      [
        companyId,
        d.unitId,
        d.unitNumber,
        d.buildingId,
        d.buildingName,
        d.buildingCode,
        d.propertyName,
        d.propertyCode,
        d.tenantId,
        d.leaseNumber,
        d.startDate,
        d.endDate ?? null,
        d.monthlyRent,
        d.depositAmount ?? 0,
        d.billingDay ?? 1,
        d.status ?? null,
        d.notes ?? null,
      ],
    )
  ).rows[0];
}
export async function updateLease(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_leases SET lease_number=COALESCE($3,lease_number),start_date=COALESCE($4,start_date),
      end_date=COALESCE($5,end_date),monthly_rent=COALESCE($6,monthly_rent),deposit_amount=COALESCE($7,deposit_amount),
      billing_day=COALESCE($8,billing_day),status=COALESCE($9,status),notes=COALESCE($10,notes),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          d.leaseNumber,
          d.startDate,
          d.endDate,
          d.monthlyRent,
          d.depositAmount,
          d.billingDay,
          d.status,
          d.notes,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function terminateLease(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_leases SET status='TERMINATED', termination_date=$3, termination_reason=$4, updated_at=NOW()
     WHERE company_id=$1 AND id=$2 AND status <> 'TERMINATED' RETURNING *`,
        [companyId, id, d.terminationDate, d.terminationReason ?? null],
      )
    ).rows[0] ?? null
  );
}
export async function deleteLease(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_leases WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

export async function findLeaseCharges(companyId: string, leaseId: string) {
  return (
    await query(
      `SELECT lc.* FROM rental_lease_charges lc JOIN rental_leases l ON l.id=lc.lease_id
     WHERE l.company_id=$1 AND lc.lease_id=$2 ORDER BY lc.created_at DESC`,
      [companyId, leaseId],
    )
  ).rows;
}
export async function createLeaseCharge(leaseId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_lease_charges(lease_id,name,charge_type,amount,recurring) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [leaseId, d.name, d.chargeType, d.amount, d.recurring ?? true],
    )
  ).rows[0];
}
export async function deleteLeaseCharge(companyId: string, id: string) {
  return (
    (
      await query(
        `DELETE FROM rental_lease_charges lc USING rental_leases l
     WHERE lc.id=$2 AND lc.lease_id=l.id AND l.company_id=$1 RETURNING lc.id`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
