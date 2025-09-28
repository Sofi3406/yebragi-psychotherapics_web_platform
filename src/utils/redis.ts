import { createClient } from "redis";

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

// Handle errors
redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

// Connect immediately (top-level await works in ESM/TypeScript with tsx)
await redisClient.connect();

console.log("✅ Redis connected");

export default redisClient;

// For BullMQ, we export a plain connection object too
export const redisConnection = {
  host: "127.0.0.1",
  port: 6379,
};
