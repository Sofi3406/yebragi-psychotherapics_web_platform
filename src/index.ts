import express from "express";
import cors from "cors"; 
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import paymentRoutes from "./routes/payment.routes";
import articlesRoutes from "./routes/articles.routes";
import chatRoutes from "./routes/chat.routes";
import { requestLoggingMiddleware, errorLoggingMiddleware } from "./middleware/logging.middleware";
import { logger } from "./utils/logger";
import meetRoutes from "./routes/meet.routes";
import notifyRoutes from "./routes/notify.routes";
import adminArticlesRoute from "./routes/adminArticles.route";
import userRoutes from "./routes/user.routes";
import therapistRoutes from "./routes/therapist.routes";

const app = express();

// CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);

/* ✅ Core middleware */
app.use(requestLoggingMiddleware);
app.use(express.json()); 

/* ✅ Routes */
app.use("/api/users", userRoutes);
app.use("/api/admin/articles", adminArticlesRoute);
app.use("/api/meet", meetRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/v1/auth", authRoutes); 
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/articles", articlesRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/therapists", therapistRoutes);

/* ✅ Health check route */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* ✅ Error logging */
app.use(errorLoggingMiddleware);

/* ✅ Global error handlers */
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection", { reason, promise }, "PROCESS");
});

process.on("uncaughtException", (error) => {
  logger.error(
    "Uncaught Exception",
    { error: error.message, stack: error.stack },
    "PROCESS"
  );
  process.exit(1);
});

/* ✅ Start server */
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  logger.info(`✅ Server is running on http://localhost:${PORT}`, {}, "BOOT");
});

export default app;