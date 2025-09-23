import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { validateRequest } from "../middleware/validateRequest";
import { chatMessageSchema } from "../validators/chat.validators";

const router = Router();

router.post("/message", validateRequest(chatMessageSchema), chatController.sendMessage);

export default router;
