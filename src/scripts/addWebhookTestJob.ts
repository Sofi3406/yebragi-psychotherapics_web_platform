import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1", // use the same Redis config as your worker
  port: 6379,
});

const webhookQueue = new Queue("webhookQueue", { connection });

async function main() {
  const tx_ref = `test_ref_${Date.now()}`;
  await webhookQueue.add("verifyTransaction", { tx_ref });

  console.log(`✅ Test job added to queue for tx_ref: ${tx_ref}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed to add test job:", err);
    process.exit(1);
  });
