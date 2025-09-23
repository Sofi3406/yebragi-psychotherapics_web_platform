import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export class UserService {
  async register(email: string, password: string, fullName: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, fullName, role },
    });

    console.log(`📧 Mock email sent to ${email}: OTP code 123456`);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ sub: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  async refresh(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const newAccess = jwt.sign(
        { sub: payload.sub, role: payload.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      return { accessToken: newAccess, refreshToken: token };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  async verify(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    // Mock OTP verification
    if (otp === "123456") {
      return { success: true, message: "OTP verified" };
    }
    return { success: false, message: "Invalid OTP" };
  }
}

export const userService = new UserService();
