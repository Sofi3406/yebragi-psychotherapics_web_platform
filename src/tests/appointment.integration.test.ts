import request from "supertest";
import app from "../index";
import prisma from "../prismaClient";
import { v4 as uuidv4 } from "uuid";

describe("Appointment Integration", () => {
  const patientId = uuidv4();
  const therapistId = uuidv4();
  const slotId = uuidv4();

  beforeAll(() => {
    jest.spyOn(prisma.appointment, "create").mockResolvedValue({
      id: "apt-1",
      patientId,
      therapistId,
      slotId,
      status: "PENDING",
      meetLink: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create an appointment", async () => {
    const res = await request(app)
      .post("/api/v1/appointments")
      .send({
        patientId,
        therapistId,
        slotId,
        notes: "First session",
      });

    if (res.status !== 201) {
      console.log("Validation error:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id", "apt-1");
    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: {
        patientId,
        therapistId,
        slotId,
        notes: "First session",
      },
    });
  });
});
