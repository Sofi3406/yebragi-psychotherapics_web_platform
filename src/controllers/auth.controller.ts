import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendEmail } from "../utils/emailUtil";
import { logger } from "../utils/logger";

const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required" });
    }

    // Create user and generate OTP
    const result = await authService.register(email, password, fullName);

    // Send OTP email
    const otp = result?.otp || "N/A";
    const html = `
      <h2>Welcome to Yebragi Psychotherapics, ${fullName}!</h2>
      <p>Use the following OTP code to verify your account:</p>
      <h3 style="color:#2E86C1;">${otp}</h3>
      <p>This code expires in 10 minutes. If you didn’t request this, please ignore this email.</p>
    `;

    await sendEmail(
      email,
      "Your Yebragi Psychotherapics OTP Code",
      `Your OTP code is: ${otp}`,
      html
    );

    logger.info("✅ OTP email sent successfully", { email, otp }, "auth.controller");

    return res.status(201).json({
      message: "User registered successfully. OTP has been sent via email.",
      user: result.user,
    });
  } catch (error: any) {
    logger.error("❌ Register error", error.message, "auth.controller");
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authService.login(email, password);
    if (result?.accessToken) {
      return res.status(200).json(result);
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error: any) {
    logger.error("❌ Login error", error.message, "auth.controller");
    return res
      .status(401)
      .json({ message: error.message || "Invalid credentials" });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const result = await authService.refresh(refreshToken);
    if (result?.accessToken) {
      return res.status(200).json(result);
    }

    return res.status(401).json({ message: "Invalid refresh token" });
  } catch (error: any) {
    logger.error("❌ Refresh error", error.message, "auth.controller");
    return res
      .status(401)
      .json({ message: error.message || "Invalid refresh token" });
  }
};

const verify = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    const result = await authService.verify(email, otp);
    if (result?.message && /verified/i.test(result.message)) {
      return res.status(200).json(result);
    }

    return res.status(400).json({ message: "Invalid or expired verification code" });
  } catch (error: any) {
    logger.error("❌ Verify error", error.message, "auth.controller");
    return res
      .status(400)
      .json({ message: error.message || "Invalid verification code" });
  }
};

const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await authService.resendOtp(email);

    // Send OTP email
    const html = `<h2>🔐 New OTP Code</h2><p>Your new verification code is <b>${result.otp}</b>. It will expire in 10 minutes.</p>`;
    await sendEmail(
      result.email,
      "Your new OTP Code - Yebragi Psychotherapics",
      `Your new OTP code is: ${result.otp}`,
      html
    );

    return res.status(200).json({
      message: "OTP resent successfully.",
      email: result.email,
    });
  } catch (error: any) {
    logger.error("❌ Resend OTP error", error.message, "auth.controller");
    return res.status(400).json({
      message: error.message || "Failed to resend OTP",
    });
  }
};

export const authController = {
  register,
  login,
  refresh,
  verify,
  resendOtp, 
};