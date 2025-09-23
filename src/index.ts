import express from "express";
import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointment.routes";
import paymentRoutes from "./routes/payment.routes";
import articlesRoutes from "./routes/articles.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();
app.use(express.json());

// Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/articles", articlesRoutes);
app.use("/api/v1/chat", chatRoutes);

export default app;
