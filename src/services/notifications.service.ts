import * as repo from "../repositories/notifications.repository";

export const listNotifications = (
  companyId: string,
  userId: string,
  filters: { limit: number; unreadOnly: boolean },
) => repo.findNotifications(companyId, userId, filters);

export async function countUnreadNotifications(
  companyId: string,
  userId: string,
) {
  return { count: await repo.countUnreadNotifications(companyId, userId) };
}

export async function markNotificationRead(
  companyId: string,
  userId: string,
  id: string,
) {
  const notification = await repo.markNotificationRead(companyId, userId, id);
  if (!notification) throw new Error("NOTIFICATION_NOT_FOUND");
  return notification;
}

export const markAllNotificationsRead = (companyId: string, userId: string) =>
  repo.markAllNotificationsRead(companyId, userId);
