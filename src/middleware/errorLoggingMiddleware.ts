import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger"; 

// Logs errors and sends structured JSON response
export const errorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).requestId || "unknown";

  logger.error(`Unhandled error: ${err.message}`, {
    requestId,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  }, "ERROR");

  res.status(500).json({
    message: "Internal server error",
    requestId,
    timestamp: new Date().toISOString(),
  });

  next(err); 
};