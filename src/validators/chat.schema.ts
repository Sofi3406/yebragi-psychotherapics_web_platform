import { z } from "zod";

export const chatMessageSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    message: z.string().min(1),
  }),
});
