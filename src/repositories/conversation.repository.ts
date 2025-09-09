// src/repositories/conversation.repository.ts
import { PrismaClient, Conversation } from "@prisma/client";

const prisma = new PrismaClient();

export const ConversationRepository = {
  async create(data: Omit<Conversation, "id" | "createdAt">) {
    return prisma.conversation.create({ data });
  },

  async findById(id: string) {
    return prisma.conversation.findUnique({ where: { id } });
  },
};
