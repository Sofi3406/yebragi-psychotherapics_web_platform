import { normalizeUrl } from "./normalizeUrl";

describe("normalizeUrl", () => {
  it("strips query parameters", () => {
    expect(normalizeUrl("https://example.com/page?utm=123&foo=bar")).toBe("https://example.com/page");
  });
  it("works for no query", () => {
    expect(normalizeUrl("https://example.com/page")).toBe("https://example.com/page");
  });
});
