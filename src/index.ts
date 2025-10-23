import express from "express";
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import paymentRoutes from "./routes/payment.routes";
import articlesRoutes from "./routes/articles.routes";
import chatRoutes from "./routes/chat.routes";
import { requestLoggingMiddleware, errorLoggingMiddleware } from "./middleware/logging.middleware";
import { logger } from "./utils/logger";
import meetRoutes from "./routes/meet.routes";


const app = express();

app.use("/api/meet", meetRoutes);

// Apply middleware
app.use(requestLoggingMiddleware);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/articles", articlesRoutes);
app.use("/api/v1/chat", chatRoutes);

// Error handling middleware (must be last)
app.use(errorLoggingMiddleware);

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise }, 'PROCESS');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack }, 'PROCESS');
  process.exit(1);
});

export default app;
