import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { redisConnection } from "../utils/redis";

dotenv.config();

try {
  const worker = new Worker(
    "send-otp",
    async (job) => {
      console.log("Processing OTP job:", job.data);

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: '"Yebragi Psychotherapics" <no-reply@yebragi.com>',
        to: job.data.email,
        subject: "Your OTP Code",
        text: `Your OTP is ${job.data.otp}`,
      });

      console.log("📧 Message sent:", info.messageId);
      console.log("🔗 Preview:", nodemailer.getTestMessageUrl(info));
      return true;
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });
} catch (err) {
  console.error("Worker crashed:", err);
}
