import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import prisma from "../prismaClient";

export const meetWorker = new Worker(
  "meet-creation",
  async (job) => {
    const { appointmentId } = job.data;

    const meetLink = `https://meet.fake-service.com/${appointmentId}`;

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetLink },
    });

    console.log(`✅ Meet link created for appointment ${appointmentId}: ${meetLink}`);
    return { meetLink };
  },
  { connection: redisConnection }
);

meetWorker.on("failed", (job, err) => {
  console.error(`❌ MeetWorker failed for job ${job?.id}:`, err);
});
