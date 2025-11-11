// src/controllers/chat.controller.ts
import { Response } from "express";
import prisma from "../prismaClient";
import { chatbotService } from "../services/chatbot.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const chatController = {
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const message = (req.body.message ?? req.body.content ?? "").toString();
      const authUserId = req.user?.id as string | undefined;

      if (!authUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Step 1: persist message in conversation
      let conversation = await prisma.conversation.findFirst({
        where: { userId: authUserId },
        include: { messages: true },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: authUserId,
            messages: {
              create: { content: message, sender: "USER" },
            },
          },
          include: { messages: true },
        });
      } else {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: message,
            sender: "USER",
          },
        });
      }

      // Step 2: get chatbot reply
      const botReply = await chatbotService.processMessage(message);

      // Step 3: persist bot reply
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: botReply[0],

          sender: "BOT",
        },
      });

      res.json({ response: botReply[0], conversationId: conversation.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
