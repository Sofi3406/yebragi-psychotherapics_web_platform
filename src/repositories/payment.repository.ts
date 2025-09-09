// src/repositories/payment.repository.ts
import { PrismaClient, Payment } from "@prisma/client";

const prisma = new PrismaClient();

export const PaymentRepository = {
  async createPayment(data: Omit<Payment, "id" | "createdAt" | "updatedAt">) {
    return prisma.payment.create({ data });
  },

  async findByTxRef(txRef: string) {
    return prisma.payment.findUnique({ where: { txRef } });
  },

  async updateStatus(id: string, status: "INITIATED" | "COMPLETED" | "FAILED") {
    return prisma.payment.update({
      where: { id },
      data: { status },
    });
  },

  async listByAppointment(appointmentId: string) {
    return prisma.payment.findMany({ where: { appointmentId } });
  },
};
