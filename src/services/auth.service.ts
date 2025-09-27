import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { sendOtpQueue } from "../queues/sendOtpQueue"; // ⬅️ import queue

class AuthService {
  async register(email: string, password: string, fullName: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    // 🔑 generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // enqueue OTP email job
    await sendOtpQueue.add("send-otp", { email, otp });

    return {
      message: "User registered successfully. OTP will be sent via email.",
      user,
    };
  }

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

    return { accessToken, refreshToken, user };
  }

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
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
  }
}

export const authService = new AuthService();
