import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
        requestId: req.requestId,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateUuidParam(name: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[name];
    if (typeof value !== "string" || !z.string().uuid().safeParse(value).success) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${name} identifier`,
        requestId: req.requestId,
      });
    }
    next();
  };
}
