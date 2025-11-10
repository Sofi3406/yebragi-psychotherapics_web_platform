import { Router } from "express";
import { authController } from "../controllers/auth.controller"; 
import { validateRequest } from "../middleware/validateRequest";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifySchema,
} from "../validators/auth.schema";

const router = Router();


// Route for user registration
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/resend-otp", authController.resendOtp);

// Route for user login
router.post("/login", validateRequest(loginSchema), authController.login);

// Route for refreshing tokens
router.post("/refresh", validateRequest(refreshSchema), authController.refresh);

// Route for verifying user accounts
router.post("/verify", validateRequest(verifySchema), authController.verify);

export default router;