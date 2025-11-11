import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json({
        message: "Validation error",
        error: err.errors,
      });
    }
  };