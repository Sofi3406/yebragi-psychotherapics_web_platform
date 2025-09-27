// src/__tests__/extractor/psychologyToday.test.ts
import { extractPsychologyToday } from "../../extractors/psychologyToday";


describe("extractPsychologyToday", () => {
  it("should return a non-empty list of candidates", async () => {
    const html = "<html><body><h1>Mock Psychology Today Page</h1></body></html>";

    const results = await extractPsychologyToday(html);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Check structure of the first result
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("url");
  });

  it("should contain a sample article with correct fields", async () => {
    const results = await extractPsychologyToday("<html></html>");

    expect(results[0].title).toBe("Sample Psychology Article");
    expect(results[0].url).toBe("https://psychologytoday.com/sample");
  });
});
