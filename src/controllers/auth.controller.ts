import { Request, Response } from "express";
import { authService } from "../services/auth.service";

const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body.body || req.body;
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

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body.body || req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await authService.login(email, password);
    if (result && result.accessToken) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return res
      .status(401)
      .json({ message: error.message || "Invalid credentials" });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body.body || req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const result = await authService.refresh(refreshToken);
    if (result && result.accessToken) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  } catch (error: any) {
    console.error("Refresh error:", error);
    return res
      .status(401)
      .json({ message: error.message || "Invalid refresh token" });
  }
};

const verify = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body.body || req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP code are required" });
    }
    const result = await authService.verify(email, otp);
    if (result && result.message && /verified/i.test(result.message)) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ message: "Invalid verification code" });
    }
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
