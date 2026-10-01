CREATE TABLE rental_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,
  recipient_user_id UUID REFERENCES rental_users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key VARCHAR(255),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, dedupe_key)
);

CREATE INDEX idx_rental_notifications_company_created
  ON rental_notifications(company_id, created_at DESC);

CREATE INDEX idx_rental_notifications_recipient_unread
  ON rental_notifications(recipient_user_id, created_at DESC)
  WHERE read_at IS NULL;