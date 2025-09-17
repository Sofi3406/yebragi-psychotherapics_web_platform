import { scraperService } from "../services/scraper.service";

// Mock the extractor so we don’t depend on real parsing
jest.mock("../extractors/psychologyToday", () => ({
  extractPsychologyToday: jest.fn(() => [
    { title: "Managing Anxiety", url: "https://www.psychologytoday.com/anxiety" },
  ]),
}));

describe("ScraperService", () => {
  test("should return psychology today articles", async () => {
    const articles = await scraperService.runSite("psychologyToday");

    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0].url).toContain("psychologytoday");
    expect(articles[0].title).toBe("Managing Anxiety");
  });

  test("should throw error for unsupported site", async () => {
    await expect(scraperService.runSite("unknown" as any))
      .rejects
      .toThrow("Site not supported");
  });
});
