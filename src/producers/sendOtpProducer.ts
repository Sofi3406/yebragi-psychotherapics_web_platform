import { Queue } from "bullmq";
import redisConnection from "../utils/redis";

// Create queue
const otpQueue = new Queue("send-otp", { connection: redisConnection });

async function main() {
  // Read email + otp from command line args
  const email = process.argv[2] || "sofi@example.com";
  const otp = process.argv[3] || Math.floor(100000 + Math.random() * 900000).toString();

  const job = await otpQueue.add("send-otp-email", { email, otp });

  console.log("✅ Job added:", job.id, { email, otp });
  process.exit(0);
}

main().catch((err) => {
  console.error("Producer failed:", err);
  process.exit(1);
});

