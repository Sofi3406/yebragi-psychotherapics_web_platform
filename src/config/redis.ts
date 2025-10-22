import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";

// ✅ Export this so other files can use the connection instance
export const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
});

export const redisConnection = {
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
};

// ✅ Create new queues and workers (QueueScheduler no longer needed in v5)
export const createQueue = (name: string) => new Queue(name, { connection });
export const createWorker = (name: string, processor: any) =>
  new Worker(name, processor, { connection });
