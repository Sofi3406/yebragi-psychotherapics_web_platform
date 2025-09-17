import { paymentService } from "../services/payment.service";
import prisma from "../prismaClient";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../prismaClient", () => ({
  payment: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe("PaymentService", () => {
  test("should create payment with txRef", async () => {
    (prisma.payment.create as jest.Mock).mockResolvedValue({ id: "pay1", txRef: "CHAPA-123" });

    const result = await paymentService.initiatePayment("a1", 200);
    expect(result.payment.id).toBe("pay1");
    expect(result.checkoutUrl).toContain("chapa.co");
  });

  test("should verify payment and update status", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { status: "success" } },
    });

    (prisma.payment.update as jest.Mock).mockResolvedValue({
      id: "pay1",
      txRef: "CHAPA-123",
      status: "success",
    });

    const status = await paymentService.verifyPayment("CHAPA-123");

    expect(status).toBe("success");
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { txRef: "CHAPA-123" },
      data: { status: "success" },
    });
  });
});
