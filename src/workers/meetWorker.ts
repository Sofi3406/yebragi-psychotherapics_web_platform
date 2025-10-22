import { Worker, Job } from "bullmq";
import { meetClient } from "../services/meet.client";
import prisma from "../prismaClient";
import { connection } from "../config/redis"; // use shared connection instance

// Background worker for generating Meet links
export const meetWorker = new Worker(
  "meet-link",
  async (job) => {
    const { appointmentId, title } = job.data;
    console.log("⏳ Generating meet link for:", appointmentId);

    // Generate the link (mock or real)
    const meetLink = await meetClient.createMeetLink(appointmentId, title);

    // Attempt to save link into the database
    try {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { meetLink },
      });
      console.log("✅ Meet link created and saved:", meetLink);
    } catch (err: any) {
      if (err.code === "P2025") {
        console.warn("⚠️ Appointment not found in DB, skipping update:", appointmentId);
      } else {
        console.error("❌ Prisma error while saving meet link:", err.message);
        throw err;
      }
    }

    return { meetLink };
  },
  {
    connection,
    concurrency: 3,
  }
);

// Error‑handling for failed jobs
meetWorker.on("failed", (job: Job | undefined, err: Error) => {
  if (!job) {
    console.error("❌ MeetWorker failed without job:", err.message);
    return;
  }
  console.error(`❌ MeetWorker job ${job.id} failed:`, err.message);
});
