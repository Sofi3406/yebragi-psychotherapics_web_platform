// src/tests/appointment.integration.test.ts
import request from "supertest";
import app from "../index";
import prisma from "../prismaClient";

// Mock Prisma
jest.mock("../prismaClient", () => ({
  appointment: {
    create: jest.fn(),
  },
}));

describe("Appointment Integration", () => {
  const mockAppointment = {
    id: "apt-1",
    userId: "user-1",
    therapistId: "therapist-1",
    date: new Date().toISOString(),
    status: "PENDING",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an appointment", async () => {
    (prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

    const res = await request(app)
      .post("/api/v1/appointments")
      .send({
        userId: "user-1",
        therapistId: "therapist-1",
        date: mockAppointment.date,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", "apt-1");
    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        therapistId: "therapist-1",
        date: mockAppointment.date,
      },
    });
  });
});
