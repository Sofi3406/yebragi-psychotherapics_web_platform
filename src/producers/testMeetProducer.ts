// src/producers/testMeetProducer.ts
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

const meetQueue = new Queue("meet-creation", { connection: redisConnection });

async function main() {
  await meetQueue.add("createMeetJob", { appointmentId: "test-123" });
  console.log("✅ Test meet job added to queue!");
  process.exit(0);
}

main();
