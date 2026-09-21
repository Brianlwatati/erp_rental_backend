import type { Response } from "express";

export function fail(
  res: Response,
  message: string,
  status = 400,
  errors?: unknown,
) {
  return res.status(status).json({ success: false, message, errors });
}
