import { Request, Response, NextFunction } from "express";
import * as s from "../services/tenant.service";
const c = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.listTenants(c(r), r.query.status as string | undefined),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getTenant(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res
      .status(201)
      .json({ success: true, data: await s.createTenant(c(r), r.body) });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateTenant(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteTenant(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
export async function listDocuments(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    res.json({
      success: true,
      data: await s.listTenantDocuments(c(r), param(r, "tenantId")),
    });
  } catch (e) {
    n(e);
  }
}
export async function addDocument(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.addTenantDocument(c(r), param(r, "tenantId"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function removeDocument(
  r: Request,
  res: Response,
  n: NextFunction,
) {
  try {
    await s.deleteTenantDocument(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
