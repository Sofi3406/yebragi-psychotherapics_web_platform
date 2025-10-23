import { Request, Response } from "express";
import prisma from "../prismaClient";
import { scraperService } from "../services/scraper.service";

// Define the expected structure for scraped articles
type ScrapedArticle = {
  title: string;
  url: string;
  content?: string;
};

export class ArticlesController {
  // List all articles with pagination and optional search
  async list(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};
      if (search) {
        whereClause = {
          OR: [
            { title: { contains: search as string, mode: "insensitive" } },
            { content: { contains: search as string, mode: "insensitive" } },
          ],
        };
      }

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where: whereClause,
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
          include: { scrapeJob: true },
        }),
        prisma.article.count({ where: whereClause }),
      ]);

      return res.json({
        articles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error listing articles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Retrieve a single article by ID
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const article = await prisma.article.findUnique({
        where: { id },
        include: { scrapeJob: true },
      });

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      return res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Scrape new articles and save them in the database
  async scrape(req: Request, res: Response) {
    try {
      const { site } = req.body;

      // Create a new scrape job record
      const scrapeJob = await prisma.scrapeJob.create({
        data: { status: "RUNNING" },
      });

      try {
        // Execute scraping service
        const scrapedArticles = (await scraperService.runSite(site)) as ScrapedArticle[];

        // Upsert scraped articles
        const savedArticles = await Promise.all(
          scrapedArticles.map((articleData) =>
            prisma.article.upsert({
              where: { url: articleData.url },
              update: {
                title: articleData.title,
                content: articleData.content ?? "",
                scrapeJobId: scrapeJob.id,
              },
              create: {
                title: articleData.title,
                content: articleData.content ?? "",
                url: articleData.url,
                scrapeJobId: scrapeJob.id,
              },
            })
          )
        );

        // Mark job as completed
        await prisma.scrapeJob.update({
          where: { id: scrapeJob.id },
          data: { status: "COMPLETED" },
        });

        return res.status(201).json({
          message: "Scrape job completed successfully",
          jobId: scrapeJob.id,
          articlesScraped: savedArticles.length,
          articles: savedArticles,
        });
      } catch (scrapeError) {
        // Mark job as failed if scraping errors occur
        await prisma.scrapeJob.update({
          where: { id: scrapeJob.id },
          data: { status: "FAILED" },
        });

        console.error("Scraping error:", scrapeError);
        return res.status(500).json({
          message: "Scraping failed",
          jobId: scrapeJob.id,
          error: "Failed to scrape articles",
        });
      }
    } catch (error) {
      console.error("Error creating scrape job:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Retrieve all scrape job histories
  async getScrapeJobs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [jobs, total] = await Promise.all([
        prisma.scrapeJob.findMany({
          skip,
          take: Number(limit),
          orderBy: { createdAt: "desc" },
          include: {
            articles: { select: { id: true, title: true, url: true } },
          },
        }),
        prisma.scrapeJob.count(),
      ]);

      return res.json({
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching scrape jobs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const articlesController = new ArticlesController();
