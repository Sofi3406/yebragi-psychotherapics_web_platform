// src/controllers/chat.controller.ts
import { Request, Response } from "express";
import prisma from "../prismaClient";
import { chatbotService } from "../services/chatbot.service";

export const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { userId, message } = req.body;

      // Step 1: persist message in conversation
      let conversation = await prisma.conversation.findFirst({
        where: { userId },
        include: { messages: true },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId,
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

      res.json({ reply: botReply });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
