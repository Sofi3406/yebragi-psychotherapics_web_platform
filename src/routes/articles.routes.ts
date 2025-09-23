import { Router } from "express";
import { articlesController } from "../controllers/articles.controller";
import { validateRequest } from "../middleware/validateRequest";
import { scrapeArticlesSchema } from "../validators/article.schema";

const router = Router();

router.get("/", articlesController.list);
router.get("/:id", articlesController.getOne);
router.post("/admin/scrape", validateRequest(scrapeArticlesSchema), articlesController.scrape);

export default router;
