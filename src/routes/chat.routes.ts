import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { validateRequest } from "../middleware/validateRequest";
import { chatMessageSchema } from "../validators/chat.validators";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.post("/message", authMiddleware, validateRequest(chatMessageSchema), chatController.sendMessage);

export default router;
