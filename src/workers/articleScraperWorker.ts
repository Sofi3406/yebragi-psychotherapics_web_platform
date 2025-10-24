import { Worker, Job } from "bullmq";
import puppeteer, { Browser, Page } from "puppeteer";
import prisma from "../prismaClient";
import { scraperSites } from "../config/scraperSites";
import { normalizeUrl } from "../utils/normalizeUrl";
import IORedis from "ioredis";

// Reusable Redis connection for BullMQ
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// Launch a shared browser instance to reduce overhead
let browser: Browser | null = null;

// Helper to launch (or reuse) Puppeteer browser
async function getBrowser(): Promise<Browser> {
  if (browser && (await browser.pages()).length < 10) {
    return browser;
  }
  if (browser) {
    console.log("♻️ Restarting browser to free memory...");
    await browser.close();
  }

  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
      "--no-zygote",
    ],
  });

  return browser;
}

// Define worker
export const articleScrapeWorker = new Worker(
  "article-scrape",
  async (job: Job) => {
    console.log(`🕷️ Starting scrape job ${job.id}...`);

    for (const site of scraperSites) {
      if (!site.allowed) continue;

      const browser = await getBrowser();
      const page = await browser.newPage();

      try {
        console.log(`🌐 Scraping: ${site.siteKey}`);

        // Run site-specific extraction
        const candidates = await site.extractor(page);
        console.log(`📑 Extracted ${candidates.length} candidates from ${site.siteKey}`);

        // Process and store results
        for (const candidate of candidates) {
          candidate.url = normalizeUrl(candidate.url);

          await prisma.article.upsert({
            where: { url: candidate.url },
            update: {
              title: candidate.title || "Untitled",
              content: candidate.content || "",
              siteKey: site.siteKey,
              status: "PUBLISHED",
            },
            create: {
              title: candidate.title || "Untitled",
              content: candidate.content || "",
              url: candidate.url,
              siteKey: site.siteKey,
              status: "PUBLISHED",
              publishedAt: new Date(),
            },
          });
        }

        // Respect rate limit between sites
        await new Promise((res) => setTimeout(res, site.rateLimitMs ?? 2000));
      } catch (err) {
        console.error(`❌ Scrape error for site ${site.siteKey}:`, err);
      } finally {
        // Prevent memory leaks by properly closing pages
        await page.goto("about:blank").catch(() => {});
        await page.close().catch(() => {});
      }
    }

    console.log(`✅ Finished scraping for job ${job.id}.`);
    return { status: "done" };
  },
  { connection }
);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down articleScrapeWorker...");
  await articleScrapeWorker.close();
  if (browser) await browser.close();
  await connection.quit();
  process.exit(0);
});

// Event logging
articleScrapeWorker.on("ready", () => {
  console.log("🚀 articleScrapeWorker connected to Redis and ready.");
});

articleScrapeWorker.on("failed", (job, err) => {
  console.error(`❌ articleScrapeWorker failed for job ${job?.id}:`, err);
});

articleScrapeWorker.on("completed", (job) => {
  console.log(`🎉 articleScrapeWorker job ${job.id} completed successfully.`);
});
