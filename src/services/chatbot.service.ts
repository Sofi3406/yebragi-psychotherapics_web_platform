import prisma from "../prismaClient";

export class ChatbotService {
  async processMessage(message: string) {
    if (message.toLowerCase().includes("anxiety")) {
      const articles = await prisma.article.findMany({
        where: { title: { contains: "anxiety", mode: "insensitive" } },
        take: 3,
      });
      return articles.map((a) => `${a.title} → ${a.url}`);
    }
    return ["Sorry, I can only fetch articles right now."];
  }
}

export const chatbotService = new ChatbotService();
