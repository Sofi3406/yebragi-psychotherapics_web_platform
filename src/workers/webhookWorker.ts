import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { verifyChapaTx } from "../services/webhookService";

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",      // Redis container or local instance
  port: 6379,             // Change to 6380 if using redis-alt container
  maxRetriesPerRequest: null, // Required for BullMQ workers
});

// Initialize BullMQ worker
const worker = new Worker(
  "webhookQueue",
  async (job: Job) => {
    const { tx_ref } = job.data;

    if (!tx_ref) throw new Error("Missing tx_ref in job data");

    console.log(`🔁 Processing webhook verification for tx_ref: ${tx_ref}`);

    const result = await verifyChapaTx(tx_ref);

    // Log payment verification result
    if (result.status === "success") {
      console.log(`✅ Payment verified and updated for tx_ref: ${tx_ref}`);
    } else {
      console.warn(
        `⚠️ Payment verification failed for ${tx_ref}: ${result.reason || result.status}`
      );
    }

    return result;
  },
  { connection }
);

// Event: Worker is ready
worker.on("ready", () => {
  console.log("🚀 Worker is ready and connected to Redis. Waiting for jobs...");
});

// Event: Job completed successfully
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed successfully for tx_ref: ${job.data.tx_ref}`);
});

// Event: Job failed
worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed for tx_ref: ${job?.data?.tx_ref}`);
  console.error("Error details:", err);
});

// Event: Redis connection or internal error
worker.on("error", (err) => {
  console.error("💥 Worker encountered an error:", err);
});

// Event: Worker drained (no more jobs left to process)
worker.on("drained", () => {
  console.log("📭 Queue is drained — no more jobs to process.");
});

// Graceful shutdown on SIGINT (Ctrl + C)
process.on("SIGINT", async () => {
  console.log("🛑 Stopping BullMQ worker gracefully...");
  await worker.close();
  await connection.quit();
  console.log("✅ Worker has shut down safely.");
  process.exit(0);
});
