import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";

class AuthService {
  // ✅ Register new user + generate OTP
  async register(email: string, password: string, fullName: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) throw new Error("User already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName,
      },
    });

    // Generate OTP (6-digit numeric)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Extended expiry: 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min from now

    // Store OTP in database
    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code: otp,
        expiresAt,
        verified: false,
      },
    });

    return {
      message: "User registered successfully. OTP will be sent via email.",
      user: { id: user.id, email: user.email, fullName: user.fullName },
      otp, // used by controller for email
    };
  }

  // ✅ Login with email & password
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    // Block unverified users
    if (!user.isVerified) {
      throw new Error("Account not verified. Please verify your email OTP first.");
    }

    // Generate JWT tokens
    const secret = process.env.JWT_SECRET || "secret";
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      secret,
      { expiresIn: "7d" }
    );

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ✅ Refresh access token
  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET || "secret"
      ) as { id: string };

      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "15m" }
      );

      return { accessToken: newAccessToken, refreshToken };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }

  // ✅ Verify OTP
  async verify(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await prisma.otp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) throw new Error("No OTP found for this user");

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check match
    if (otpRecord.code !== code) {
      throw new Error("Invalid OTP code.");
    }

    // Update OTP + user verification
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isVerified: true },
    });

    return { message: "Verification successful" };
  }

  // ✅ Resend OTP (now properly throttled)
  async resendOtp(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User already verified");

    // Check last OTP — allow only once every 2 minutes
    const lastOtp = await prisma.otp.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 2 * 60 * 1000) {
      throw new Error("Please wait 2 minutes before requesting another OTP.");
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Also extended expiry to 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code: otp,
        expiresAt,
        verified: false,
      },
    });

    return {
      message: "A new OTP has been generated. It will be sent via email.",
      email: normalizedEmail,
      otp,
    };
  }
}

export const authService = new AuthService();
