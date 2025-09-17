import axios from "axios";
import { extractPsychologyToday } from "../extractors/psychologyToday";

export class ScraperService {
  async runSite(site: "psychologyToday") {
    if (site === "psychologyToday") {
      const html = "<html>mock page</html>"; 
      return extractPsychologyToday(html);
    }
    throw new Error("Site not supported");
  }
}

export const scraperService = new ScraperService();
