// src/services/scraper/extractors/who.ts
import { Page } from "puppeteer";

export interface ArticleCandidate {
  title: string;
  url: string;
  summary?: string;
  source: string;
}

/** 
 * Extracts mental health articles from the WHO site listing page using Puppeteer.
 * @param page Puppeteer page instance
 */
export async function extract(page: Page): Promise<ArticleCandidate[]> {
  // Go to the WHO mental health articles listing page
  await page.goto("https://www.who.int/mental_health/news", { waitUntil: "domcontentloaded" });

  // Extract article list; selectors must match actual WHO layout
  const articles = await page.evaluate(() => {
    // Example: use correct selector after inspecting actual page
    return Array.from(document.querySelectorAll(".list-view--item")).map(item => {
      const a = item.querySelector("a");
      const summary = item.querySelector(".auto-summary, .article-summary, p");
      return {
        title: a?.textContent?.trim() || "",
        url: a?.href || "",
        summary: summary?.textContent?.trim(),
        source: "WHO",
      };
    });
  });

  // Return normalized article candidates
  return articles;
}
