// src/validators/chat.validators.ts
import { z } from "zod";

export const chatMessageSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().min(1, "Message cannot be empty"),
});
