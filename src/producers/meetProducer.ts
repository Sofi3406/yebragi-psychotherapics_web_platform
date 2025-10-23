import { Queue } from "bullmq";
import { connection } from "../config/redis";

const meetQueue = new Queue("meet-link", { connection });

export const enqueueMeetCreation = async (appointmentId: string) => {
  const job = await meetQueue.add("create-meet", { appointmentId });
  console.log("📤 Meet creation job enqueued:", job.id);
  return job;
};
