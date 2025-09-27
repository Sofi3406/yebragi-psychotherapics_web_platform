import { chatbotService } from "../services/chatbot.service";
import prisma from "../prismaClient";

jest.mock("../prismaClient", () => ({
  article: {
    findMany: jest.fn(),
  },
}));

describe("ChatbotService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and return articles when message contains 'anxiety'", async () => {
    (prisma.article.findMany as jest.Mock).mockResolvedValue([
      { title: "Coping with Anxiety", url: "https://example.com/anxiety1" },
      { title: "Understanding Anxiety", url: "https://example.com/anxiety2" },
    ]);

    const result = await chatbotService.processMessage("I have anxiety issues");
    expect(prisma.article.findMany).toHaveBeenCalledWith({
      where: { title: { contains: "anxiety", mode: "insensitive" } },
      take: 3,
    });
    expect(result).toEqual([
      "Coping with Anxiety → https://example.com/anxiety1",
      "Understanding Anxiety → https://example.com/anxiety2",
    ]);
  });

  it("should return default message if no intent is matched", async () => {
    const result = await chatbotService.processMessage("hello bot");
    expect(result).toEqual(["Sorry, I can only fetch articles right now."]);
    expect(prisma.article.findMany).not.toHaveBeenCalled();
  });
});
