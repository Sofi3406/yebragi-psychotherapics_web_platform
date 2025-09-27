import { Queue } from "../config/redis";

export const sendOtpQueue = new Queue("send-otp", {
  connection: undefined, // will use default redis from config
});
