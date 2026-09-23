import { pool, query } from "../config/database";

type Executor = { query: typeof pool.query };
const exec = (e?: Executor) => e ?? pool;

export async function findRequests(
  companyId: string,
  filters: { status?: string; unitId?: string; propertyId?: string },
) {
  const clauses = ["company_id=$1"];
  const params: unknown[] = [companyId];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status=$${params.length}`);
  }
  if (filters.unitId) {
    params.push(filters.unitId);
    clauses.push(`unit_id=$${params.length}`);
  }
  if (filters.propertyId) {
    params.push(filters.propertyId);
    clauses.push(`property_id=$${params.length}`);
  }
  return (
    await query(
      `SELECT * FROM rental_maintenance_requests WHERE ${clauses.join(" AND ")} ORDER BY reported_at DESC`,
      params,
    )
  ).rows;
}
export async function findRequestById(
  companyId: string,
  id: string,
  e?: Executor,
) {
  return (
    (
      await exec(e).query(
        "SELECT * FROM rental_maintenance_requests WHERE company_id=$1 AND id=$2",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
export async function createRequest(companyId: string, d: any) {
  return (
    await query(
      `INSERT INTO rental_maintenance_requests(company_id,property_id,unit_id,tenant_id,title,description,priority,created_by)
     VALUES($1,$2,$3,$4,$5,$6,COALESCE($7,'MEDIUM'),$8) RETURNING *`,
      [
        companyId,
        d.propertyId,
        d.unitId ?? null,
        d.tenantId ?? null,
        d.title,
        d.description ?? null,
        d.priority ?? null,
        d.createdBy ?? null,
      ],
    )
  ).rows[0];
}
export async function updateRequest(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_maintenance_requests SET title=COALESCE($3,title),description=COALESCE($4,description),
      priority=COALESCE($5,priority),tenant_id=COALESCE($6,tenant_id),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [companyId, id, d.title, d.description, d.priority, d.tenantId],
      )
    ).rows[0] ?? null
  );
}
export async function setRequestStatus(
  companyId: string,
  id: string,
  status: string,
  extra: { vendorId?: string | null; resolvedAt?: boolean } = {},
) {
  return (
    (
      await query(
        `UPDATE rental_maintenance_requests SET status=$3,
      assigned_vendor_id=COALESCE($4, assigned_vendor_id),
      resolved_at=CASE WHEN $5 THEN NOW() ELSE resolved_at END,
      updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          status,
          extra.vendorId ?? null,
          extra.resolvedAt ?? false,
        ],
      )
    ).rows[0] ?? null
  );
}
export async function deleteRequest(companyId: string, id: string) {
  return (
    (
      await query(
        "DELETE FROM rental_maintenance_requests WHERE company_id=$1 AND id=$2 RETURNING id",
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}

export async function findCosts(companyId: string, requestId: string) {
  return (
    await query(
      `SELECT mc.* FROM rental_maintenance_costs mc JOIN rental_maintenance_requests mr ON mr.id=mc.maintenance_request_id
     WHERE mr.company_id=$1 AND mc.maintenance_request_id=$2 ORDER BY mc.created_at DESC`,
      [companyId, requestId],
    )
  ).rows;
}
export async function createCost(
  requestId: string,
  d: any,
  expenseId: string | null,
  e: Executor,
) {
  return (
    await e.query(
      `INSERT INTO rental_maintenance_costs(maintenance_request_id,vendor_id,description,amount,expense_id)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [requestId, d.vendorId ?? null, d.description, d.amount, expenseId],
    )
  ).rows[0];
}
export async function deleteCost(companyId: string, id: string) {
  return (
    (
      await query(
        `DELETE FROM rental_maintenance_costs mc USING rental_maintenance_requests mr
     WHERE mc.id=$2 AND mc.maintenance_request_id=mr.id AND mr.company_id=$1 RETURNING mc.id`,
        [companyId, id],
      )
    ).rows[0] ?? null
  );
}
