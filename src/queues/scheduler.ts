import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// Create queue (no QueueScheduler needed)
const articleQueue = new Queue("article-scrape", { connection });

(async () => {
  console.log("🗓️ Scheduling daily article-scrape job...");

  await articleQueue.add(
    "article-scrape",
    {},
    {
      repeat: { cron: "0 2 * * *" }, // every day at 2 AM
      jobId: "daily-article-scrape",
      removeOnFail: true,
      removeOnComplete: true,
    }
  );

  console.log("✅ Scheduler configured for article-scrape (BullMQ v5+).");
  await connection.quit();
})();
