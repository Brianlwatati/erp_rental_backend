import { NextFunction, Request, Response } from "express";
import type { AccessTokenUser } from "../modules/auth/auth.types";
import * as s from "../services/notifications.service";
import type {
  MarkAllNotificationsReadResult,
  NotificationListItem,
  UnreadNotificationCount,
} from "../types/notification.types";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

const auth = (r: Request): AccessTokenUser => r.auth!;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(
  r: Request,
  res: Response<ApiResponse<NotificationListItem[]>>,
  n: NextFunction,
) {
  try {
    const limitText = typeof r.query.limit === "string" ? r.query.limit : "50";
    const limit = Number(limitText);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "limit must be an integer between 1 and 100",
      });
      return;
    }
    res.json({
      success: true,
      data: await s.listNotifications(auth(r).companyId, auth(r).userId, {
        limit,
        unreadOnly: r.query.unreadOnly === "true",
      }),
    });
  } catch (e) {
    n(e);
  }
}

export async function unreadCount(
  r: Request,
  res: Response<ApiResponse<UnreadNotificationCount>>,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.countUnreadNotifications(auth(r).companyId, auth(r).userId),
    });
  } catch (e) {
    n(e);
  }
}

export async function markRead(
  r: Request,
  res: Response<ApiResponse<NotificationListItem>>,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.markNotificationRead(
        auth(r).companyId,
        auth(r).userId,
        param(r, "id"),
      ),
    });
  } catch (e) {
    n(e);
  }
}

export async function markAllRead(
  r: Request,
  res: Response<ApiResponse<MarkAllNotificationsReadResult>>,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.markAllNotificationsRead(auth(r).companyId, auth(r).userId),
    });
  } catch (e) {
    n(e);
  }
}
