import { Worker, Job } from "bullmq";
import { connection } from "../config/redis";
import prisma from "../prismaClient";
import chalk from "chalk";

const queueName = "meet-link";

console.log(chalk.cyan.bold(`[${new Date().toISOString()}] 🚀 Meet Worker started — listening on queue: ${queueName}`));

const worker = new Worker(
  queueName,
  async (job: Job) => {
    const { appointmentId, title } = job.data;
    console.log(chalk.yellow(`[Job ${job.id}] 🕒 Processing meet link for appointment: ${appointmentId}`));

    // Simulate external API call latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a mock link — replace with actual integration later (e.g., Google Meet)
    const meetLink = `https://meet.mock/${appointmentId}`;

    // Save generated link in DB
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetLink },
    });

    console.log(chalk.greenBright(`[Job ${job.id}] ✅ Meet link created and saved: ${meetLink}`));

    return { meetLink, message: "Meet link generated successfully" };
  },
  { connection }
);

// ---- Lifecycle Events ----
worker.on("ready", () => {
  console.log(chalk.blue(`[${queueName}] Worker ready and connected to Redis.`));
});

worker.on("active", (job) => {
  console.log(chalk.magenta(`[${queueName}] Job ${job.id} → Active`));
});

worker.on("completed", (job, result) => {
  console.log(chalk.green(`[${queueName}] Job ${job.id} → Completed successfully`));
  console.log(chalk.gray(`Result: ${JSON.stringify(result)}`));
});

worker.on("failed", (job, err) => {
  if (job) {
    console.log(chalk.red(`[${queueName}] Job ${job.id} → Failed: ${err.message}`));
  } else {
    console.log(chalk.red(`[${queueName}] Job failed before assignment: ${err.message}`));
  }
});

worker.on("stalled", (jobId) => {
  console.warn(chalk.redBright(`[${queueName}] ⚠️ Job ${jobId} → Stalled and being retried.`));
});

worker.on("error", (err) => {
  console.error(chalk.bgRed.white(`❌ Worker error: ${err.message}`));
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log(chalk.yellow("\nGracefully shutting down Meet Worker..."));
  await worker.close();
  process.exit(0);
});
