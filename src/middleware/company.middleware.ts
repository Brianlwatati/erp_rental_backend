import { Request, Response, NextFunction } from "express";
export function requireCompany(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.header("x-company-id"))
    return res
      .status(400)
      .json({
        success: false,
        message: "x-company-id header is required during development",
      });
  next();
}
