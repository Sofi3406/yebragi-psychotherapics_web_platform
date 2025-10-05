import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const meetQueue = new Queue("meet-creation", {
  connection: redisConnection,
});
