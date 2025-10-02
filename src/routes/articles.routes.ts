import { Router } from "express";
import { articlesController } from "../controllers/articles.controller";
import { validateRequest } from "../middleware/validateRequest";
import { scrapeArticlesSchema } from "../validators/article.schema";

const router = Router();

// Public routes
router.get("/", articlesController.list);
router.get("/:id", articlesController.getOne);

// Admin routes
router.post("/admin/scrape", validateRequest(scrapeArticlesSchema), articlesController.scrape);
router.get("/admin/jobs", articlesController.getScrapeJobs);

export default router;
