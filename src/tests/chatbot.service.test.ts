import { chatbotService } from "../services/chatbot.service";

jest.mock("../prismaClient", () => ({
  article: {
    findMany: jest.fn(),
  },
}));
const prisma = require("../prismaClient");

describe("ChatbotService", () => {
  test("should return articles about anxiety", async () => {
    (prisma.article.findMany as jest.Mock).mockResolvedValue([
      { title: "Coping with Anxiety", url: "https://example.com/anxiety" },
    ]);

    const result = await chatbotService.processMessage("find articles about anxiety");
    expect(result[0]).toContain("Coping with Anxiety");
    expect(result[0]).toContain("https://example.com/anxiety");
  });

  test("should return fallback for unknown topics", async () => {
    (prisma.article.findMany as jest.Mock).mockResolvedValue([]);

    const result = await chatbotService.processMessage("tell me about happiness");
    expect(result[0]).toBe("Sorry, I can only fetch articles right now.");
  });
});
