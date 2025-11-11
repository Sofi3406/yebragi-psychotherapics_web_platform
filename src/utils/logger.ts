export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  module?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  log(level: LogLevel, message: string, data?: any, module?: string) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      module
    };

    if (this.isDevelopment) {
      // Color output for development
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[90m'  // Gray
      };
      
      console.log(
        `${colors[level]}${level.toUpperCase()}\x1b[0m [${logEntry.timestamp}] ${module ? `[${module}] ` : ''}${message}`,
        data ? data : ''
      );
    } else {
      // Structured logging for production
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, data?: any, module?: string) {
    this.log(LogLevel.ERROR, message, data, module);
  }

  warn(message: string, data?: any, module?: string) {
    this.log(LogLevel.WARN, message, data, module);
  }

  info(message: string, data?: any, module?: string) {
    this.log(LogLevel.INFO, message, data, module);
  }

  debug(message: string, data?: any, module?: string) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data, module);
    }
  }
}

export const logger = new Logger();


