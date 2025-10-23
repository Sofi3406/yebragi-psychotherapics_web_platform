import { z } from "zod";

export const createMeetJobSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, "Appointment ID is required"),
    title: z.string().optional(),
  }),
});
