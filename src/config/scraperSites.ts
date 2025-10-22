// src/config/scraperSites.ts

import { extract as extractWho } from "../services/scraper/extractors/who";
import { extract as extractPsychologyToday } from "../services/scraper/extractors/psychologyToday";
import { extract as extractAPA } from "../services/scraper/extractors/apa";

/**
 * List of supported scraper target sites with config, extractor, and rate limiting.
 */
export const scraperSites = [
  {
    siteKey: "who",
    displayName: "World Health Organization",
    listingUrl: "https://www.who.int/mental_health/news",
    rateLimitMs: 5000,
    extractor: extractWho,
    allowed: true, // Flag can be set based on robots.txt check
  },
  {
    siteKey: "psychologyToday",
    displayName: "Psychology Today",
    listingUrl: "https://www.psychologytoday.com/us/basics/mental-health/news",
    rateLimitMs: 8000,
    extractor: extractPsychologyToday,
    allowed: true,
  },
  {
    siteKey: "apa",
    displayName: "APA",
    listingUrl: "https://www.apa.org/news/mental-health",
    rateLimitMs: 8000,
    extractor: extractAPA,
    allowed: true,
  },
  // Add more sources here as needed
];
