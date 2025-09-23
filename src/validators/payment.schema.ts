import { z } from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid(),
    amount: z.number().positive(),
  }),
});

// Webhook raw payload (don’t validate too hard, just accept JSON)
export const webhookSchema = z.object({
  body: z.unknown(),
});
