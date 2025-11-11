// src/validators/chat.validators.ts
import { z } from "zod";

const messageString = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string().min(1, "Message cannot be empty")
);

export const chatMessageSchema = z.union([
  z.object({ message: messageString }),
  z.object({ content: messageString }),
]);
