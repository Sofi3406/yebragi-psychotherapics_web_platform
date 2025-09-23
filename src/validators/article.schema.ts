import { z } from "zod";

export const scrapeArticlesSchema = z.object({
  body: z.object({
    site: z.enum(["psychologyToday"]),
  }),
});
