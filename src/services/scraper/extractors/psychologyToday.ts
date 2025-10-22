// src/services/scraper/extractors/psychologyToday.ts
import { Page } from "puppeteer";
import { ArticleCandidate } from "./who";

export async function extract(page: Page): Promise<ArticleCandidate[]> {
  await page.goto("https://www.psychologytoday.com/us/basics/mental-health/news", { waitUntil: "domcontentloaded" });

  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".blog-listing .blog-item")).map(item => ({
      title: item.querySelector(".blog-title")?.textContent?.trim() || "",
      url: item.querySelector("a")?.href || "",
      summary: item.querySelector(".blog-summary")?.textContent?.trim() || "",
      source: "Psychology Today",
    }))
  );
}
