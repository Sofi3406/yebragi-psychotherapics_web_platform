import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";


// ✅ Create a shared Redis connection
const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
});

// ✅ Export BullMQ-compatible connection config
export const redisConnection = {
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
};

// ✅ Optional helpers (if you use them elsewhere)
export const createQueue = (name: string) => new Queue(name, { connection });
export const createWorker = (name: string, processor: any) => new Worker(name, processor, { connection });
export const createScheduler = (name: string) => new QueueScheduler(name, { connection });
