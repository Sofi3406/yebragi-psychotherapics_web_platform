import { Queue, Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

export { connection, Queue, Worker, QueueScheduler };
