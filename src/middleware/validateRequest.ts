
import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Only validate the body (matches your schemas)
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json({ error: err.errors });
    }
  };
