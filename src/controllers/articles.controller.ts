import { Request, Response } from "express";
import prisma from "../prismaClient";
import { scraperService } from "../services/scraper.service";

export class ArticlesController {
  async list(req: Request, res: Response) {
    const articles = await prisma.article.findMany();
    return res.json(articles);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id } });
    return res.json(article);
  }

  async scrape(req: Request, res: Response) {
    const scraped = await scraperService.runSite("psychologyToday");
    // Save as JobRecord normally, for now we just return
    return res.status(201).json({ message: "Scrape job queued", scraped });
  }
}

export const articlesController = new ArticlesController();
