import { z } from "zod";

export const createAppointmentSchema = z.object({
  therapistId: z.string().uuid(),
  slotId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
});

export const updateAppointmentSchema = z.object({
  // ❌ removed `date` since it doesn't exist in your model
  notes: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
});
