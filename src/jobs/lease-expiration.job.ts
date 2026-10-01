import { withTransaction } from "../config/database";

export async function expireEndedLeases(runDate: string) {
  await withTransaction(async (client) => {
    const expired = await client.query<{
      id: string;
      company_id: string;
      lease_number: string;
      unit_id: string;
      unit_number: string;
      end_date: string;
    }>(
      `UPDATE rental_leases SET status='EXPIRED', updated_at=NOW()
       WHERE status='ACTIVE' AND end_date IS NOT NULL AND end_date < $1::date
       RETURNING id, company_id, lease_number, unit_id, unit_number, end_date`,
      [runDate],
    );
    const unitIds = [...new Set(expired.rows.map((lease) => lease.unit_id))];
    if (!unitIds.length) return;

    for (const lease of expired.rows) {
      await client.query(
        `INSERT INTO rental_notifications(
           company_id, notification_type, title, message, entity_type, entity_id, payload, dedupe_key
         ) VALUES($1, 'LEASE_EXPIRED', 'Lease expired', $2, 'LEASE', $3, $4::jsonb, $5)
         ON CONFLICT (company_id, dedupe_key) DO NOTHING`,
        [
          lease.company_id,
          `Lease ${lease.lease_number} for unit ${lease.unit_number} expired on ${lease.end_date}.`,
          lease.id,
          JSON.stringify({
            leaseId: lease.id,
            leaseNumber: lease.lease_number,
            unitId: lease.unit_id,
            unitNumber: lease.unit_number,
            endDate: lease.end_date,
          }),
          `lease-expired:${lease.id}`,
        ],
      );
    }

    await client.query(
      `UPDATE rental_units u SET status='VACANT', updated_at=NOW()
       WHERE u.id=ANY($1::uuid[])
         AND NOT EXISTS (
           SELECT 1 FROM rental_leases l WHERE l.unit_id=u.id AND l.status='ACTIVE'
         )`,
      [unitIds],
    );
  });
}
