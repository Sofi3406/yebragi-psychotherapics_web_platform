import request from "supertest";
import app from "../index"; 
import prisma from "../prismaClient";
import { chatbotService } from "../services/chatbot.service";

// Mock Prisma
jest.mock("../prismaClient", () => ({
  conversation: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  message: {
    create: jest.fn(),
  },
  article: {
    findMany: jest.fn(),
  },
}));

// Mock chatbot service
jest.mock("../services/chatbot.service", () => {
  return {
    chatbotService: {
      processMessage: jest.fn(),
    },
  };
});

describe("Chat Controller", () => {
  const mockUserId = "11111111-1111-1111-1111-111111111111"; // valid UUID

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new conversation and reply", async () => {
    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.conversation.create as jest.Mock).mockResolvedValue({ id: "conv-1", userId: mockUserId });
    (chatbotService.processMessage as jest.Mock).mockResolvedValue(["Hello! How can I help you?"]);

    const res = await request(app)
      .post("/api/v1/chat/message") // ✅ match your route
      .send({ userId: mockUserId, message: "Hello" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body.reply[0]).toBe("Hello! How can I help you?");
    expect(prisma.conversation.create).toHaveBeenCalled();
  });

  it("should use existing conversation if found", async () => {
    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({ id: "conv-1", userId: mockUserId });
    (chatbotService.processMessage as jest.Mock).mockResolvedValue(["Hi again!"]);
    (prisma.message.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/v1/chat/message")
      .send({ userId: mockUserId, message: "Hi" });

    expect(res.status).toBe(200);
    expect(res.body.reply[0]).toBe("Hi again!");
    expect(prisma.message.create).toHaveBeenCalledTimes(2); // USER + BOT
  });

  it("should handle chatbot service errors", async () => {
    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({ id: "conv-1", userId: mockUserId });
    (chatbotService.processMessage as jest.Mock).mockRejectedValue(new Error("Chatbot service failed"));

    const res = await request(app)
      .post("/api/v1/chat/message")
      .send({ userId: mockUserId, message: "test" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Chatbot service failed");
  });
});
