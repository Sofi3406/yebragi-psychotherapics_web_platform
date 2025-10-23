import { Queue } from "bullmq";
import prisma from "../prismaClient";
import { connection } from "../config/redis";

const meetQueue = new Queue("meet-link", { connection });

export const meetService = {
  async enqueueMeetJob(appointmentId: string, title?: string) {
    const job = await meetQueue.add("create-meet", { appointmentId, title });
    return job;
  },

  async getJobStatus(jobId: string) {
    const job = await meetQueue.getJob(jobId);
    if (!job) return null;
    return {
      id: job.id,
      name: job.name,
      state: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
    };
  },

  async getMeetLink(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { meetLink: true },
    });
    return appointment?.meetLink || null;
  },
};
