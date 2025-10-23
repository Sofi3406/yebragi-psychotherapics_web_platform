import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const sendOtpQueue = new Queue("send-otp", { connection });
