import { Router } from "express";
import { therapistController } from "../controllers/therapist.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", therapistController.list);
router.get("/:id", therapistController.getOne);
router.get("/:id/availability", therapistController.getAvailability);

// Protected routes (therapist only)
router.post("/availability", authMiddleware, therapistController.createAvailability);
router.delete("/availability/:slotId", authMiddleware, therapistController.deleteAvailability);

export default router;

