// src/services/scraper/extractors/who.test.ts
import { extract, ArticleCandidate } from "./who";

const mockPage = {
  goto: jest.fn().mockResolvedValue(undefined), // mock .goto!
  evaluate: jest.fn()
} as any;

describe("WHO Extractor", () => {
  it("returns normalized ArticleCandidate objects", async () => {
    mockPage.evaluate.mockResolvedValue([
      {
        title: "Fact Sheet: Mental Health",
        url: "https://who.int/example-article",
        summary: "Important facts about mental health",
        source: "WHO"
      }
    ]);
    const result = await extract(mockPage);
    expect(result[0].source).toBe("WHO");
    expect(result[0].title).toContain("Mental");
  });
});
