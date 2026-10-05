import { query, withTransaction } from "../config/database";

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

export async function findLeasesByUnitId(companyId: string, unitId: string) {
  return (
    await query(
      `SELECT * FROM rental_leases
       WHERE company_id=$1 AND unit_id=$2
       ORDER BY created_at DESC`,
      [companyId, unitId],
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
      `INSERT INTO rental_leases(company_id,unit_id,unit_number,building_id,building_name,building_code,
      property_name,property_code,tenant_id,tenant_first_name,tenant_last_name,tenant_email,tenant_phone,lease_number,
      start_date,end_date,monthly_rent,deposit_amount,rentpluscharges,include_deposit_in_first_invoice,billing_day,status,notes)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$17,$19,$20,COALESCE($21,'ACTIVE'),$22) RETURNING *`,
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
        d.tenantFirstName,
        d.tenantLastName,
        d.tenantEmail,
        d.tenantPhone,
        d.leaseNumber,
        d.startDate,
        d.endDate ?? null,
        d.monthlyRent,
        d.depositAmount ?? 0,
        d.includeDepositInFirstInvoice ?? false,
        d.billingDay ?? 1,
        d.status ?? null,
        d.notes ?? null,
      ],
    )
  ).rows[0];
}

async function extendLeaseWithClient(
  client: import("pg").PoolClient,
  companyId: string,
  source: { id: string },
  leaseNumber: string,
) {
  const renewed = (
    await client.query(
      `INSERT INTO rental_leases(
         company_id,unit_id,unit_number,building_id,building_name,building_code,
         property_name,property_code,tenant_id,tenant_first_name,tenant_last_name,
         tenant_email,tenant_phone,lease_number,start_date,end_date,monthly_rent,
         deposit_amount,rentpluscharges,include_deposit_in_first_invoice,
         billing_day,status,notes
       )
       SELECT company_id,unit_id,unit_number,building_id,building_name,building_code,
         property_name,property_code,tenant_id,tenant_first_name,tenant_last_name,
         tenant_email,tenant_phone,$3,end_date+1,
         (end_date+1+INTERVAL '1 month'-INTERVAL '1 day')::date,monthly_rent,
         deposit_amount,monthly_rent,FALSE,billing_day,'DRAFT',notes
       FROM rental_leases
       WHERE company_id=$1 AND id=$2
       RETURNING *`,
      [companyId, source.id, leaseNumber],
    )
  ).rows[0];

  await client.query(
    `INSERT INTO rental_lease_charges(lease_id,name,charge_type,amount,recurring)
     SELECT $2,name,charge_type,amount,TRUE
     FROM rental_lease_charges
     WHERE lease_id=$1 AND recurring=TRUE`,
    [source.id, renewed.id],
  );
  await client.query(
    `UPDATE rental_leases
     SET is_lease_extended=TRUE,updated_at=NOW()
     WHERE company_id=$1 AND id=$2`,
    [companyId, source.id],
  );
  return (
    await client.query(
      `UPDATE rental_leases
       SET rentpluscharges=monthly_rent+COALESCE(
         (SELECT SUM(amount) FROM rental_lease_charges WHERE lease_id=$1),0
       ),updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [renewed.id],
    )
  ).rows[0];
}

async function lockRenewableLease(
  client: import("pg").PoolClient,
  companyId: string,
  id: string,
) {
  const source = (
    await client.query(
      `SELECT id,status,end_date,is_lease_extended
       FROM rental_leases
       WHERE company_id=$1 AND id=$2
       FOR UPDATE`,
      [companyId, id],
    )
  ).rows[0];
  if (!source) throw new Error("LEASE_NOT_FOUND");
  if (!["ACTIVE", "EXPIRED"].includes(source.status))
    throw new Error("LEASE_NOT_RENEWABLE");
  if (source.is_lease_extended) throw new Error("LEASE_ALREADY_EXTENDED");
  if (!source.end_date) throw new Error("LEASE_END_DATE_REQUIRED");
  return source;
}

export async function extendLeaseMonthNew(
  companyId: string,
  id: string,
  leaseNumber: string,
) {
  return withTransaction(async (client) => {
    const source = await lockRenewableLease(client, companyId, id);
    return extendLeaseWithClient(client, companyId, source, leaseNumber);
  });
}

export async function extendAllLeasesForMonth(
  companyId: string,
  month: string,
  createLeaseNumber: () => string,
) {
  return withTransaction(async (client) => {
    const candidates = (
      await client.query(
        `SELECT id
         FROM rental_leases
         WHERE company_id=$1
           AND end_date >= ($2 || '-01')::date
           AND end_date < (($2 || '-01')::date + INTERVAL '1 month')
           AND status IN ('ACTIVE', 'EXPIRED')
           AND is_lease_extended=FALSE
         ORDER BY end_date,id
         FOR UPDATE`,
        [companyId, month],
      )
    ).rows as Array<{ id: string }>;

    const renewals = [];
    for (const candidate of candidates) {
      const source = await lockRenewableLease(client, companyId, candidate.id);
      renewals.push(
        await extendLeaseWithClient(
          client,
          companyId,
          source,
          createLeaseNumber(),
        ),
      );
    }
    return renewals;
  });
}

export async function updateLease(companyId: string, id: string, d: any) {
  return (
    (
      await query(
        `UPDATE rental_leases SET lease_number=COALESCE($3,lease_number),start_date=COALESCE($4,start_date),
      end_date=COALESCE($5,end_date),monthly_rent=COALESCE($6,monthly_rent),
      deposit_amount=COALESCE($7,deposit_amount),
        rentpluscharges=COALESCE($6,monthly_rent)+COALESCE((SELECT SUM(amount) FROM rental_lease_charges 
        WHERE lease_id=rental_leases.id),0),
      include_deposit_in_first_invoice=COALESCE($8,include_deposit_in_first_invoice),
      billing_day=COALESCE($9,billing_day),status=COALESCE($10,status),notes=COALESCE($11,notes),updated_at=NOW()
     WHERE company_id=$1 AND id=$2 RETURNING *`,
        [
          companyId,
          id,
          d.leaseNumber,
          d.startDate,
          d.endDate,
          d.monthlyRent,
          d.depositAmount,
          d.includeDepositInFirstInvoice,
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
        `UPDATE rental_leases SET status='TERMINATED', termination_date=$3, termination_reason=$4, 
        updated_at=NOW()
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
export async function createLeaseCharge(
  companyId: string,
  leaseId: string,
  d: any,
) {
  return withTransaction(async (client) => {
    const lease = await client.query(
      "SELECT id FROM rental_leases WHERE company_id=$1 AND id=$2 FOR UPDATE",
      [companyId, leaseId],
    );
    if (!lease.rowCount) return null;

    const charge = (
      await client.query(
        `INSERT INTO rental_lease_charges(lease_id,name,charge_type,amount,recurring) VALUES($1,$2,$3,$4,$5)
        RETURNING *`,
        [leaseId, d.name, d.chargeType, d.amount, d.recurring ?? true],
      )
    ).rows[0];
    await client.query(
      `UPDATE rental_leases SET rentpluscharges=monthly_rent+COALESCE(
        (SELECT SUM(amount) FROM rental_lease_charges WHERE lease_id=$1),0), updated_at=NOW()
       WHERE id=$1`,
      [leaseId],
    );
    return charge;
  });
}
export async function deleteLeaseCharge(companyId: string, id: string) {
  return withTransaction(async (client) => {
    const lease = await client.query(
      `SELECT l.id FROM rental_leases l JOIN rental_lease_charges lc ON lc.lease_id=l.id
       WHERE l.company_id=$1 AND lc.id=$2 FOR UPDATE OF l`,
      [companyId, id],
    );
    if (!lease.rowCount) return null;

    const deleted = (
      await client.query(
        `DELETE FROM rental_lease_charges lc USING rental_leases l
         WHERE lc.id=$2 AND lc.lease_id=l.id AND l.company_id=$1 RETURNING lc.id, lc.lease_id`,
        [companyId, id],
      )
    ).rows[0];
    if (!deleted) return null;

    await client.query(
      `UPDATE rental_leases SET rentpluscharges=monthly_rent+COALESCE(
        (SELECT SUM(amount) FROM rental_lease_charges WHERE lease_id=$1),0), updated_at=NOW()
       WHERE id=$1`,
      [deleted.lease_id],
    );
    return { id: deleted.id };
  });
}
