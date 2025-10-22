import { Request, Response } from "express";
import { enqueueArticleScrape } from "../producers/articleScrapeProducer";

export const adminScrapeArticles = async (req: Request, res: Response) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const job = await enqueueArticleScrape();
  return res.status(201).json({ jobId: job.id });
};
