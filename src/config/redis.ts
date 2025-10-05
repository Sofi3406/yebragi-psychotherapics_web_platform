import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";

export const redisConnection = new IORedis(); // ✅ now exported

export const createQueue = (name: string) =>
  new Queue(name, { connection: redisConnection });

export const createWorker = (name: string, processor: any) =>
  new Worker(name, processor, { connection: redisConnection });
