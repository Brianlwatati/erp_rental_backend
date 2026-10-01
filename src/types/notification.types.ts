export type NotificationType = "LEASE_EXPIRED" | (string & {});

export type NotificationEntityType = "LEASE" | (string & {});

export type NotificationPayload = Record<string, unknown>;

export interface Notification {
  id: string;
  company_id: string;
  recipient_user_id: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: NotificationEntityType | null;
  entity_id: string | null;
  payload: NotificationPayload;
  dedupe_key: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListItem {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: NotificationEntityType | null;
  entity_id: string | null;
  payload: NotificationPayload;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
}

export interface NotificationReadReceipt {
  notification_id: string;
  user_id: string;
  read_at: string;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface MarkAllNotificationsReadResult {
  markedRead: number;
}
