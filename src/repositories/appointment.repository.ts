// src/repositories/appointment.repository.ts
import { PrismaClient, Appointment } from "@prisma/client";

const prisma = new PrismaClient();

export const AppointmentRepository = {
  async create(data: Omit<Appointment, "id" | "createdAt" | "updatedAt">) {
    return prisma.appointment.create({ data });
  },

  async findById(id: string) {
    return prisma.appointment.findUnique({ where: { id } });
  },

  async listByUser(patientId: string) {
    return prisma.appointment.findMany({ where: { patientId } });
  },

  async listByTherapistAndRange(therapistId: string, start: Date, end: Date) {
    return prisma.appointment.findMany({
      where: {
        therapistId,
        startTime: { gte: start },
        endTime: { lte: end },
      },
    });
  },

  async checkConflicts(therapistId: string, start: Date, end: Date) {
    return prisma.appointment.findFirst({
      where: {
        therapistId,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });
  },

  async update(id: string, data: Partial<Appointment>) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  },
};
