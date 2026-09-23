import { NextFunction, Request, Response } from "express";
import * as service from "../services/overview.service";

export async function getOverview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getCompanyOverview(req.auth!.companyId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
