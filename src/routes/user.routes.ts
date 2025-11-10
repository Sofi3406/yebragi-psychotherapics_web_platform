import { Router } from "express";
import { userController } from "../controllers/user.controller"; 
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Health/test endpoint
router.get("/test", (req, res) => {
  res.json({ ok: true, msg: "User route active" });
});

// Get current user's profile (requires authentication)
router.get("/me", authMiddleware, userController.getProfile);

// Update current user's profile (requires authentication)
router.put("/profile", authMiddleware, userController.updateProfile);

export default router;