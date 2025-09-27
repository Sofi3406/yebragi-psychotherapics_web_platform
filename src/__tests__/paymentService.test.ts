// src/__tests__/paymentService.test.ts
import { paymentService } from "../services/payment.service";
import prisma from "../prismaClient";
import axios from "axios";

// Mock Prisma + Axios
jest.mock("../prismaClient", () => ({
  payment: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("PaymentService", () => {
  const appointmentId = "appt-123";
  const amount = 500;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initiate payment in mock mode", async () => {
    (prisma.payment.create as jest.Mock).mockResolvedValue({
      id: "pay-1",
      appointmentId,
      amount,
      txRef: "CHAPA-123",
      status: "PENDING",
    });

    const result = await paymentService.initiatePayment(appointmentId, amount, true);

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        appointmentId,
        amount,
        status: "PENDING",
      }),
    });

    expect(result.checkoutUrl).toMatch(/https:\/\/checkout.chapa.co/);
    expect(result.payment.txRef).toBeDefined();
  });

  it("should initiate payment in real mode (calls Chapa)", async () => {
    (prisma.payment.create as jest.Mock).mockResolvedValue({
      id: "pay-2",
      appointmentId,
      amount,
      txRef: "CHAPA-456",
      status: "PENDING",
    });

    mockedAxios.post.mockResolvedValue({
      data: {
        data: { checkout_url: "https://chapa.co/checkout/CHAPA-456" },
      },
    });

    const result = await paymentService.initiatePayment(appointmentId, amount, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.chapa.co/v1/transaction/initialize",
      expect.any(Object),
      expect.any(Object)
    );
    expect(result.checkoutUrl).toContain("chapa.co/checkout");
  });

  it("should verify payment and update DB", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { status: "success" } },
    });

    (prisma.payment.update as jest.Mock).mockResolvedValue({
      id: "pay-3",
      appointmentId,
      amount,
      txRef: "CHAPA-789",
      status: "success",
    });

    const status = await paymentService.verifyPayment("CHAPA-789");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.chapa.co/v1/transaction/verify/CHAPA-789",
      expect.any(Object)
    );
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { txRef: "CHAPA-789" },
      data: { status: "success" },
    });
    expect(status).toBe("success");
  });
});
