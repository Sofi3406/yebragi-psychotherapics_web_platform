import { appointmentService } from "../services/appointment.service";

jest.mock("../prismaClient", () => ({
  __esModule: true,
  default: {
    availabilitySlot: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
    },
  },
}));

import prisma from "../prismaClient";

describe("AppointmentService", () => {
  test("should book when slot is free", async () => {
    // Mock slot found
    (prisma.availabilitySlot.findFirst as jest.Mock).mockResolvedValue({ id: "slot1" });
    (prisma.appointment.create as jest.Mock).mockResolvedValue({ id: "a1" });
    (prisma.availabilitySlot.update as jest.Mock).mockResolvedValue({ id: "slot1", isBooked: true });

    const result = await appointmentService.bookAppointment("p1", "t1", new Date(), new Date());
    expect(result.id).toBe("a1");
  });

  test("should fail when slot is taken", async () => {
    (prisma.availabilitySlot.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      appointmentService.bookAppointment("p1", "t1", new Date(), new Date())
    ).rejects.toThrow("Slot not available");
  });
});
