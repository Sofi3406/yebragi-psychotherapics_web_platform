import { PrismaClient, Article } from "@prisma/client";

const prisma = new PrismaClient();

export class ArticleRepository {
  // Create new article
  static async create(data: { url: string; title: string; content?: string }): Promise<Article> {
    return prisma.article.create({ data });
  }

  // Find article by URL
  static async findByUrl(url: string): Promise<Article | null> {
    return prisma.article.findUnique({ where: { url } });
  }

  // Upsert article (insert if new, update if exists)
  static async upsertArticle(data: { url: string; title: string; content?: string }): Promise<Article> {
    return prisma.article.upsert({
      where: { url: data.url },
      update: { title: data.title, content: data.content },
      create: data,
    });
  }

  // List all articles
  static async list(): Promise<Article[]> {
    return prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  }
}
