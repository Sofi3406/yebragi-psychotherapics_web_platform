// src/producers/meetProducer.ts
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const meetQueue = new Queue("meet-link", {
  connection: redisConnection,
});

export async function enqueueMeetJob(appointmentId: string, title: string) {
  return meetQueue.add("create-meet", { appointmentId, title }, { attempts: 3 });
}
