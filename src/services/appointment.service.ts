import prisma from "../prismaClient";

export class AppointmentService {
  // Check if a slot is available for the therapist
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

  // Book an appointment for a patient
  async bookAppointment(patientId: string, therapistId: string, start: Date, end: Date) {
    // Step 1: find an available slot
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        therapistId,
        startTime: start,
        endTime: end,
        isBooked: false,
      },
    });

    if (!slot) throw new Error("Slot not available");

    // Step 2: create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        slotId: slot.id,
        status: "CONFIRMED", 
      },
    });

    // Step 3: mark slot as booked
    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return appointment;
  }
}

export const appointmentService = new AppointmentService();
