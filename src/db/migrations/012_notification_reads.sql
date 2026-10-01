CREATE TABLE rental_notification_reads (
  notification_id UUID NOT NULL REFERENCES rental_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES rental_users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX idx_rental_notification_reads_user
  ON rental_notification_reads(user_id, read_at DESC);