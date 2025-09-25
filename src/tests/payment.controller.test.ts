
import request from "supertest";
import app from "../index";
import { paymentService } from "../services/payment.service";

// Mock payment service
jest.mock("../services/payment.service", () => {
  return {
    paymentService: {
      initiatePayment: jest.fn(),
    },
  };
});

describe("Payment Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initiate a payment", async () => {
    (paymentService.initiatePayment as jest.Mock).mockResolvedValue({
      paymentId: "pay-123",
      status: "PENDING",
      amount: 100,
    });

    const res = await request(app)
      .post("/api/v1/payments/initiate")
      .send({ appointmentId: "apt-1", amount: 100 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("paymentId", "pay-123");
    expect(paymentService.initiatePayment).toHaveBeenCalledWith("apt-1", 100);
  });

  it("should handle webhook payloads", async () => {
    const payload = { paymentId: "pay-123", status: "SUCCESS" };

    const res = await request(app)
      .post("/api/v1/payments/webhook")
      .send(payload);

    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty("message", "Webhook received");
  });
});
