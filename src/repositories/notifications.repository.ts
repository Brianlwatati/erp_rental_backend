import { query, withTransaction } from "../config/database";

export async function findNotifications(
  companyId: string,
  userId: string,
  filters: { limit: number; unreadOnly: boolean },
) {
  return (
    await query(
      `SELECT n.id, n.notification_type, n.title, n.message, n.entity_type, n.entity_id,
              n.payload, n.created_at, COALESCE(nr.read_at, n.read_at) AS read_at,
              (COALESCE(nr.read_at, n.read_at) IS NOT NULL) AS is_read
       FROM rental_notifications n
       LEFT JOIN rental_notification_reads nr
         ON nr.notification_id=n.id AND nr.user_id=$2
       WHERE n.company_id=$1 AND (n.recipient_user_id IS NULL OR n.recipient_user_id=$2)
         AND ($3::boolean = FALSE OR COALESCE(nr.read_at, n.read_at) IS NULL)
       ORDER BY n.created_at DESC, n.id DESC
       LIMIT $4`,
      [companyId, userId, filters.unreadOnly, filters.limit],
    )
  ).rows;
}

export async function countUnreadNotifications(
  companyId: string,
  userId: string,
) {
  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM rental_notifications n
     LEFT JOIN rental_notification_reads nr
       ON nr.notification_id=n.id AND nr.user_id=$2
     WHERE n.company_id=$1 AND (n.recipient_user_id IS NULL OR n.recipient_user_id=$2)
       AND COALESCE(nr.read_at, n.read_at) IS NULL`,
    [companyId, userId],
  );
  return result.rows[0].count as number;
}

export async function markNotificationRead(
  companyId: string,
  userId: string,
  id: string,
) {
  return withTransaction(async (client) => {
    const notification = (
      await client.query(
        `SELECT * FROM rental_notifications
         WHERE id=$1 AND company_id=$2
           AND (recipient_user_id IS NULL OR recipient_user_id=$3)
         FOR UPDATE`,
        [id, companyId, userId],
      )
    ).rows[0];
    if (!notification) return null;

    let readAt: Date;
    if (notification.recipient_user_id === null) {
      const receipt = await client.query(
        `INSERT INTO rental_notification_reads(notification_id, user_id)
         VALUES($1, $2)
         ON CONFLICT (notification_id, user_id) DO UPDATE
           SET read_at=COALESCE(rental_notification_reads.read_at, NOW())
         RETURNING read_at`,
        [id, userId],
      );
      readAt = receipt.rows[0].read_at;
    } else {
      const updated = await client.query(
        `UPDATE rental_notifications SET read_at=COALESCE(read_at, NOW())
         WHERE id=$1 RETURNING read_at`,
        [id],
      );
      readAt = updated.rows[0].read_at;
    }
    return { ...notification, read_at: readAt, is_read: true };
  });
}

export async function markAllNotificationsRead(
  companyId: string,
  userId: string,
) {
  return withTransaction(async (client) => {
    const targeted = await client.query(
      `UPDATE rental_notifications SET read_at=NOW()
       WHERE company_id=$1 AND recipient_user_id=$2 AND read_at IS NULL
       RETURNING id`,
      [companyId, userId],
    );
    const broadcasts = await client.query(
      `INSERT INTO rental_notification_reads(notification_id, user_id)
       SELECT n.id, $2 FROM rental_notifications n
       WHERE n.company_id=$1 AND n.recipient_user_id IS NULL AND n.read_at IS NULL
       ON CONFLICT (notification_id, user_id) DO NOTHING
       RETURNING notification_id`,
      [companyId, userId],
    );
    return {
      markedRead: (targeted.rowCount ?? 0) + (broadcasts.rowCount ?? 0),
    };
  });
}
