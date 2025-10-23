import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Logs each request and its duration
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Generate unique request ID
  const requestId = Math.random().toString(36).substring(2, 11);
  (req as any).requestId = requestId;

  logger.info(`Request started: ${method} ${url}`, {
    requestId,
    ip,
    userAgent: req.get("User-Agent"),
  }, "HTTP");

  // Preserve original res.end
  const originalEnd = res.end.bind(res);

  // Override res.end to log after response completes
  res.end = ((chunk?: any, encoding?: any): Response => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info(`Request completed: ${method} ${url}`, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("content-length") || 0,
    }, "HTTP");

    return originalEnd(chunk, encoding);
  }) as unknown as typeof res.end;

  next();
};

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
