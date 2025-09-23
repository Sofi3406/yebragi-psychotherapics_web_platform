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

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh", validateRequest(refreshSchema), authController.refresh);
router.post("/verify", validateRequest(verifySchema), authController.verify);

export default router;
