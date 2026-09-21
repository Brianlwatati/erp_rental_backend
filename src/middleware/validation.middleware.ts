import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success)
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        });
    req.body = result.data;
    next();
  };
}
