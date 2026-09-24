import { Request, Response, NextFunction } from "express";
import * as s from "../services/payment.service";
const c = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    const { status, tenantId } = r.query as Record<string, string | undefined>;
    res.json({
      success: true,
      data: await s.listPayments(c(r), { status, tenantId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getPayment(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createPayment(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function allocate(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.allocatePayment(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function reverse(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.reversePayment(c(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deletePayment(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
export async function issueReceipt(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.issueReceipt(c(r), param(r, "id"), { ...r.body, issuedBy: r.auth!.userId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function listReceipts(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.listReceipts(c(r)) });
  } catch (e) {
    n(e);
  }
}
export async function getReceipt(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getReceipt(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
