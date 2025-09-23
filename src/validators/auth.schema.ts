import { z } from "zod";

// ✅ Register Schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

// ✅ Login Schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

// ✅ Refresh Schema
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
});

// ✅ Verify OTP Schema
export const verifySchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});
