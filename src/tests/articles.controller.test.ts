import request from "supertest";
import express from "express";
import { articlesController } from "../controllers/articles.controller";
import prisma from "../prismaClient";
import { scraperService } from "../services/scraper.service";

// ✅ Mock prisma and scraper
jest.mock("../prismaClient", () => ({
  article: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));
jest.mock("../services/scraper.service", () => ({
  scraperService: {
    runSite: jest.fn(),
  },
}));

// ✅ Setup test app
const app = express();
app.use(express.json());
app.get("/api/v1/articles", (req, res) => articlesController.list(req, res));
app.get("/api/v1/articles/:id", (req, res) => articlesController.getOne(req, res));
app.post("/api/v1/articles/scrape", (req, res) => articlesController.scrape(req, res));

describe("Articles Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/articles", () => {
    it("should return a list of articles", async () => {
      (prisma.article.findMany as jest.Mock).mockResolvedValue([
        { id: "art-1", title: "Article One" },
        { id: "art-2", title: "Article Two" },
      ]);

      const res = await request(app).get("/api/v1/articles");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("title", "Article One");
      expect(prisma.article.findMany).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/articles/:id", () => {
    it("should return a single article", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue({
        id: "art-123",
        title: "Test Article",
      });

      const res = await request(app).get("/api/v1/articles/art-123");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", "art-123");
      expect(prisma.article.findUnique).toHaveBeenCalledWith({ where: { id: "art-123" } });
    });

    it("should return 404 if article not found", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/v1/articles/unknown-id");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Article not found");
    });
  });

  describe("POST /api/v1/articles/scrape", () => {
    it("should trigger scraper and return confirmation", async () => {
      (scraperService.runSite as jest.Mock).mockResolvedValue(["Article A", "Article B"]);

      const res = await request(app).post("/api/v1/articles/scrape");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Scrape job queued");
      expect(res.body.scraped).toEqual(["Article A", "Article B"]);
      expect(scraperService.runSite).toHaveBeenCalledWith("psychologyToday");
    });
  });
});
