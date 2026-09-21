import { Request, Response, NextFunction } from "express";
import * as s from "../services/unit.service";
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
      data: await s.listUnits(c(r), param(r, "buildingId")),
    });
  } catch (e) {
    n(e);
  }
}
export async function get(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({ success: true, data: await s.getUnit(c(r), param(r, "id")) });
  } catch (e) {
    n(e);
  }
}
export async function create(r: Request, res: Response, n: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.createUnit(c(r), param(r, "buildingId"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function update(r: Request, res: Response, n: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateUnit(c(r), param(r, "id"), r.body),
    });
  } catch (e) {
    n(e);
  }
}
export async function remove(r: Request, res: Response, n: NextFunction) {
  try {
    await s.deleteUnit(c(r), param(r, "id"));
    res.status(204).send();
  } catch (e) {
    n(e);
  }
}
