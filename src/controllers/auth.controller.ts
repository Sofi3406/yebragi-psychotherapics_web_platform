import { Request, Response } from "express";
import { authService } from "../services/auth.service";

// Register
const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Full name, email and password are required" });
    }

    const result = await authService.register(email, password, fullName);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Login
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Login error:", error);
    return res
      .status(401)
      .json({ message: error.message || "Invalid credentials" });
  }
};

// Refresh
const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const result = await authService.refresh(refreshToken);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Refresh error:", error);
    return res
      .status(401)
      .json({ message: error.message || "Invalid refresh token" });
  }
};

// Verify OTP
const verify = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and OTP code are required" });
    }

    const result = await authService.verify(email, code);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Verify error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Invalid verification code" });
  }
};

export const authController = {
  register,
  login,
  refresh,
  verify,
};
