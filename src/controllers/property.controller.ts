import { Request, Response, NextFunction } from "express";
import * as s from "../services/property.service";
const company = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};
export async function list(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.listProperties(company(r)) });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.getProperty(company(r), param(r, "id")),
    });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.createProperty(company(r), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateProperty(company(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteProperty(company(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
