import { Router } from "express";
import { adminArticlesController } from "../controllers/adminArticles.controller";

const router = Router();

// List articles
router.get("/", adminArticlesController.list);

// Update moderation status
router.patch("/:id/status", adminArticlesController.updateStatus);

// Edit article details
router.patch("/:id", adminArticlesController.edit);

export default router;
