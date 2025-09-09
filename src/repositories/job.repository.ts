// src/repositories/job.repository.ts
import { PrismaClient, Job } from "@prisma/client";

const prisma = new PrismaClient();

export const JobRepository = {
  async create(data: Omit<Job, "id" | "createdAt">) {
    return prisma.job.create({ data });
  },

  async list() {
    return prisma.job.findMany();
  },
};
