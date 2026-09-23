import { Request, Response, NextFunction } from "express";
import * as s from "../services/unit-type.service";

const company = (r: Request) => r.auth!.companyId;
const param = (r: Request, name: string): string => {
  const value = r.params[name];
  if (Array.isArray(value)) throw new Error(`Invalid route parameter: ${name}`);
  return value;
};

export async function list(r: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await s.listUnitTypes(company(r)) });
  } catch (error) {
    next(error);
  }
}

export async function get(r: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.getUnitType(company(r), param(r, "id")),
    });
  } catch (error) {
    next(error);
  }
}

export async function create(r: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await s.createUnitType(company(r), r.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function update(r: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await s.updateUnitType(company(r), param(r, "id"), r.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(r: Request, res: Response, next: NextFunction) {
  try {
    await s.deleteUnitType(company(r), param(r, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
