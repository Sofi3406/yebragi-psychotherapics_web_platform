import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { sendOtpQueue } from "../queues/sendOtpQueue";

class AuthService {
  // Register new user + enqueue OTP
  async register(email: string, password: string, fullName: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.jobRecord.create({
      data: {
        type: "OTP",
        payload: { email: normalizedEmail, otp },
        status: "PENDING",
      },
    });

    await sendOtpQueue.add("send-otp", { email: normalizedEmail, otp });

    return {
      message: "User registered successfully. OTP will be sent via email.",
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  // Login with email + password
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
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

  // Refresh access token
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

      return { accessToken, refreshToken };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  // Verify OTP robustly with full debug output
  async verify(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch up to 10 most recent OTP jobs from DB (for robustness)
    const debugJobs = await prisma.$queryRaw<
      Array<{ id: string, payload: any, createdAt: Date, type: string }>
    >`SELECT * FROM "JobRecord"
      WHERE type = 'OTP'
      ORDER BY "createdAt" DESC
      LIMIT 10`;

    console.log("DEBUG: recent JobRecords (OTP):", JSON.stringify(debugJobs, null, 2));

    // Use pure JS filter for robustness (avoids SQL/driver JSON ambiguity)
    const job = debugJobs.find(j =>
      typeof j.payload?.email === 'string' &&
      j.payload.email.toLowerCase().trim() === normalizedEmail
    );

    if (!job) {
      console.error("No OTP job found for:", normalizedEmail);
      throw new Error("No OTP found for this user");
    }

    if (job.payload.otp !== code) {
      console.error("Wrong OTP for", normalizedEmail, "Expected:", job.payload.otp, "Received:", code);
      throw new Error("Invalid OTP");
    }

    await prisma.jobRecord.update({
      where: { id: job.id },
      data: { status: "COMPLETED" },
    });

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isVerified: true },
    });

    return { message: "Verification successful" };
  }
}

export const authService = new AuthService();
