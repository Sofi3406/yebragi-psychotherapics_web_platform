import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const articleScrapeQueue = new Queue("article-scrape", {
  connection: redisConnection,
});

export function enqueueArticleScrape() {
  return articleScrapeQueue.add("run-scrape", {});
}
