// src/tests/appointment.controller.test.ts
import request from "supertest";
import app from "../index";
import { appointmentService } from "../services/appointment.service";

// ✅ Mock validateRequest middleware (bypass schema validation)
jest.mock("../middleware/validateRequest", () => ({
  validateRequest: () => (req: any, res: any, next: any) => next(),
}));

jest.mock("../services/appointment.service");

describe("Appointment Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/appointments", () => {
    it("should create a new appointment", async () => {
      (appointmentService.createAppointment as jest.Mock).mockResolvedValue({
        id: "appt-123",
        patientId: "patient-1",
        therapistId: "therapist-1",
        slotId: "slot-1",
        status: "CONFIRMED",
      });

      const res = await request(app)
        .post("/api/v1/appointments")
        .send({
          patientId: "patient-1",
          therapistId: "therapist-1",
          slotId: "slot-1",
          status: "CONFIRMED",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", "appt-123");
      expect(appointmentService.createAppointment).toHaveBeenCalledWith({
        patientId: "patient-1",
        therapistId: "therapist-1",
        slotId: "slot-1",
        status: "CONFIRMED",
      });
    });
  });

  describe("GET /api/v1/appointments", () => {
    it("should return a list of appointments", async () => {
      (appointmentService.getAppointments as jest.Mock).mockResolvedValue([
        { id: "appt-123", patientId: "patient-1" },
      ]);

      const res = await request(app).get("/api/v1/appointments");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: "appt-123", patientId: "patient-1" }]);
      expect(appointmentService.getAppointments).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/appointments/:id", () => {
    it("should return a single appointment", async () => {
      (appointmentService.getAppointmentById as jest.Mock).mockResolvedValue({
        id: "appt-123",
        patientId: "patient-1",
      });

      const res = await request(app).get("/api/v1/appointments/appt-123");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", "appt-123");
      expect(appointmentService.getAppointmentById).toHaveBeenCalledWith("appt-123");
    });
  });

  describe("PUT /api/v1/appointments/:id", () => {
    it("should update an appointment", async () => {
      (appointmentService.updateAppointment as jest.Mock).mockResolvedValue({
        id: "appt-123",
        status: "COMPLETED",
      });

      const res = await request(app)
        .put("/api/v1/appointments/appt-123")
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "COMPLETED");
      expect(appointmentService.updateAppointment).toHaveBeenCalledWith("appt-123", { status: "COMPLETED" });
    });
  });

  describe("DELETE /api/v1/appointments/:id", () => {
    it("should delete an appointment", async () => {
      (appointmentService.deleteAppointment as jest.Mock).mockResolvedValue({});

      const res = await request(app).delete("/api/v1/appointments/appt-123");

      expect(res.status).toBe(204);
      expect(appointmentService.deleteAppointment).toHaveBeenCalledWith("appt-123");
    });
  });
});
