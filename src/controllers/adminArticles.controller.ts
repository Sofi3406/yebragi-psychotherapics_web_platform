import { Request, Response } from "express";
import prisma from "../prismaClient";

export class AdminArticlesController {
  async list(req: Request, res: Response) {
    const articles = await prisma.article.findMany({ orderBy: { updatedAt: "desc" } });
    res.json(articles);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED", "ARCHIVED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: { status, reviewedAt: new Date() },
    });

    res.json(article);
  }

  async edit(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content } = req.body;

    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: { title, content, updatedAt: new Date() },
    });

    res.json(article);
  }
}

export const adminArticlesController = new AdminArticlesController();
