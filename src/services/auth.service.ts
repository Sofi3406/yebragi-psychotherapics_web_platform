import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { sendOtpQueue } from "../queues/sendOtpQueue";

class AuthService {
  // 🔹 Register new user + enqueue OTP
  async register(email: string, password: string, fullName: string) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB with expiry (5 min)
    await prisma.jobRecord.create({
      data: {
        type: "OTP",
        payload: { email, otp },
        status: "PENDING",
      },
    });

    // Enqueue job for email delivery
    await sendOtpQueue.add("send-otp", { email, otp });

    return {
      message: "User registered successfully. OTP will be sent via email.",
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  // 🔹 Login with email + password
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // 🔹 Refresh access token
  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET || "secret"
      ) as { id: string };

      const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "15m" }
      );

      return { accessToken };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  // 🔹 Verify OTP
  async verify(email: string, code: string) {
    const job = await prisma.jobRecord.findFirst({
      where: { type: "OTP", payload: { path: ["email"], equals: email } },
      orderBy: { createdAt: "desc" }, // latest OTP
    });

    if (!job) throw new Error("No OTP found for this user");

    const storedOtp = (job.payload as any).otp;
    if (storedOtp !== code) throw new Error("Invalid OTP");

    // Mark job as completed
    await prisma.jobRecord.update({
      where: { id: job.id },
      data: { status: "COMPLETED" },
    });

    return { message: "Verification successful" };
  }
}

export const authService = new AuthService();
