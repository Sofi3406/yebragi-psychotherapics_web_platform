import { Worker } from "bullmq";
import puppeteer from "puppeteer";
import { scraperSites } from "../config/scraperSites";
import { normalizeUrl } from "../utils/normalizeUrl";
import prisma from "../prismaClient"; // assuming prisma setup

export const articleScrapeWorker = new Worker(
  "article-scrape",
  async (job) => {
    for (const site of scraperSites) {
      if (!site.allowed) continue;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      try {
        const candidates = await site.extractor(page);
        for (const candidate of candidates) {
          candidate.url = normalizeUrl(candidate.url);
          // Upsert Article in DB
          await prisma.article.upsert({
            where: { url: candidate.url },
            update: { ...candidate },
            create: { ...candidate },
          });
        }
        await new Promise(res => setTimeout(res, site.rateLimitMs)); // rate limit
      } catch (err) {
        console.error("Scrape error for site:", site.siteKey, err);
      } finally {
        await browser.close();
      }
    }
    return { status: "done" };
  },
  { connection: { host: "localhost", port: 6379 } } // update to your Redis config!
);

articleScrapeWorker.on("failed", (job, err) => {
  console.error(`❌ ArticleScrapeWorker failed for job ${job?.id}:`, err);
});
