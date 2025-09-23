import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    therapistId: z.string().uuid(),
    date: z.string().datetime(),
    notes: z.string().optional(),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z.object({
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  }),
});