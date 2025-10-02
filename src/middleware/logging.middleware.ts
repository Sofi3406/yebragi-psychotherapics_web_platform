import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Generate unique request ID
  const requestId = Math.random().toString(36).substr(2, 9);
  (req as any).requestId = requestId;

  logger.info(`Request started: ${method} ${url}`, { 
    requestId, 
    ip, 
    userAgent: req.get('User-Agent') 
  }, 'HTTP');

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    logger.info(`Request completed: ${method} ${url}`, {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0
    }, 'HTTP');

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.error(`Unhandled error: ${err.message}`, {
    requestId,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params
  }, 'ERROR');

  res.status(500).json({
    message: 'Internal server error',
    requestId,
    timestamp: new Date().toISOString()
  });
};
