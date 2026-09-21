import { Request, Response, NextFunction } from "express";
import * as s from "../services/lease.service";
const c = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    const { status, tenantId, unitId } = r.query as Record<
      string,
      string | undefined
    >;
    res.json({
      success: true,
      data: await s.listLeases(c(r), { status, tenantId, unitId }),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getLease(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createLease(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateLease(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function terminate(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.terminateLease(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteLease(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
export async function listCharges(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.listLeaseCharges(c(r), param(r, "leaseId")),
    });
  } catch (e) {
    n(e);
  }
}
export async function addCharge(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.addLeaseCharge(c(r), param(r, "leaseId"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeCharge(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteLeaseCharge(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
