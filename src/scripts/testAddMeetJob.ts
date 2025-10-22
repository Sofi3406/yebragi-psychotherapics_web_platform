import { Queue } from "bullmq";
import { connection } from "../config/redis";
const run = async () => {
  const q = new Queue("meet-link", { connection });
  await q.add("create-meet", { appointmentId: "appt123", title: "Therapy Session Test" });
  console.log("✅ Job added!");
  process.exit(0);
};

run();
