import { withTransaction } from "../config/database";

export async function expireEndedLeases(runDate: string) {
  await withTransaction(async (client) => {
    const expired = await client.query<{ unit_id: string }>(
      `UPDATE rental_leases SET status='EXPIRED', updated_at=NOW()
       WHERE status='ACTIVE' AND end_date IS NOT NULL AND end_date < $1::date
       RETURNING unit_id`,
      [runDate],
    );
    const unitIds = [...new Set(expired.rows.map((lease) => lease.unit_id))];
    if (!unitIds.length) return;

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
