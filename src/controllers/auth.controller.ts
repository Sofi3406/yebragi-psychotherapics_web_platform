// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body; // ✅ include fullName

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Full name, email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName, // ✅ now Prisma will accept this
      },
    });

    // Mock sending OTP (for test logs)
    console.log(`📧 Mock email sent to ${email}: OTP code 123456`);

    return res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ New refresh handler
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "secret") as any;
      const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET || "secret", {
        expiresIn: "1h",
      });

      return res.status(200).json({ accessToken: newAccessToken });
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ New verify handler (stub for OTP/email/etc.)
export const verify = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (code === "123456") {
      return res.status(200).json({ message: "Verification successful" });
    }

    return res.status(400).json({ message: "Invalid verification code" });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Export full controller object
export const authController = {
  register,
  login,
  refresh,
  verify,
};
