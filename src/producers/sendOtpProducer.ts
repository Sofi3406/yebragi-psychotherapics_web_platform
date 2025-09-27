import { Queue } from "bullmq";
import { redisConnection } from "../utils/redis";

const otpQueue = new Queue("send-otp", { connection: redisConnection });

async function main() {
  const job = await otpQueue.add("send-otp-email", {
    email: "test@example.com",
    otp: "123456",
  });

  console.log("✅ Job added:", job.id);
  process.exit(0);
}

main().catch((err) => {
  console.error("Producer failed:", err);
  process.exit(1);
});
