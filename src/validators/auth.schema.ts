import { z } from "zod";

/* ✅ Register Schema */
export const registerSchema = z.object({
  fullName: z
    .string({
      required_error: "Full name is required!",
    })
    .min(2, "Full name must be at least 2 characters long!"),
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email("Invalid email format!"),
  password: z
    .string({
      required_error: "Password is required!",
    })
    .min(6, "Password must be at least 6 characters long!"),
});

/* ✅ Login Schema */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email("Invalid email format!"),
  password: z
    .string({
      required_error: "Password is required!",
    })
    .min(6, "Password must be at least 6 characters long!"),
});

/* ✅ Refresh Token Schema */
export const refreshSchema = z.object({
  refreshToken: z
    .string({
      required_error: "Refresh token is required!",
    })
    .min(10, "Refresh token must be at least 10 characters long!"),
});

/* ✅ Verify OTP Schema */
export const verifySchema = z.object({
  email: z
    .string({
      required_error: "Email is required!",
    })
    .email("Invalid email format!"),
  otp: z
    .string({
      required_error: "OTP is required!",
    })
    .length(6, "OTP must be exactly 6 characters long!"),
});
