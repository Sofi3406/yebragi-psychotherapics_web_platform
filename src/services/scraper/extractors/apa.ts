// src/services/scraper/extractors/apa.ts
import { Page } from "puppeteer";
import { ArticleCandidate } from "./who";

export async function extract(page: Page): Promise<ArticleCandidate[]> {
  await page.goto("https://www.apa.org/news/mental-health", { waitUntil: "domcontentloaded" });

  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".news-listing .news-item")).map(item => ({
      title: item.querySelector(".news-title")?.textContent?.trim() || "",
      url: item.querySelector("a")?.href || "",
      summary: item.querySelector(".news-summary")?.textContent?.trim() || "",
      source: "APA",
    }))
  );
}
