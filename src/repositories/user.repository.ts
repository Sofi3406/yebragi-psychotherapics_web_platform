// src/repositories/user.repository.ts
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const UserRepository = {
  async createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">) {
    return prisma.user.create({ data });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  },

  async findByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: { verificationToken: token },
    });
  },

  async updatePasswordByToken(token: string, newPassword: string) {
    return prisma.user.updateMany({
      where: { verificationToken: token },
      data: { password: newPassword, verificationToken: null },
    });
  },
};
