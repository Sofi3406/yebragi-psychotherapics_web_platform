// src/services/appointment.service.ts
import prisma from "../prismaClient";

export class AppointmentService {
  // ✅ Check therapist availability
  async checkAvailability(therapistId: string, start: Date, end: Date) {
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        therapistId,
        startTime: start,
        endTime: end,
        isBooked: false,
      },
    });
    return !!slot;
  }

  // ✅ Book an appointment
  async bookAppointment(patientId: string, therapistId: string, start: Date, end: Date) {
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        therapistId,
        startTime: start,
        endTime: end,
        isBooked: false,
      },
    });

    if (!slot) throw new Error("Slot not available");

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        slotId: slot.id,
        status: "CONFIRMED",
      },
    });

    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return appointment;
  }

  // ✅ Add missing CRUD methods for controller
  async createAppointment(data: any) {
    return prisma.appointment.create({ data });
  }

  async getAppointments() {
    return prisma.appointment.findMany({ include: { patient: true, therapist: true } });
  }

  async getAppointmentById(id: string) {
    return prisma.appointment.findUnique({ where: { id } });
  }

  async updateAppointment(id: string, data: any) {
    return prisma.appointment.update({ where: { id }, data });
  }

  async deleteAppointment(id: string) {
    return prisma.appointment.delete({ where: { id } });
  }
}

export const appointmentService = new AppointmentService();
