import { Prisma, PaymentStatus } from "@prisma/client";
import prisma from "../prismaClient";
import { generateTxRef } from "../utils/txRef";
import axios from "axios";

type InitiatePaymentOptions = {
  userId: string;
  appointmentId: string;
  amount: number;
  email: string;
  currency: string;
  firstName?: string;
  lastName?: string;
  mockChapa?: boolean;
};

export class PaymentService {
  /**
   * Initialize a payment (mock or real)
   */
  async initiatePayment(options: InitiatePaymentOptions) {
    const {
      userId,
      appointmentId,
      amount,
      email,
      currency,
      firstName = "Yebragi",
      lastName = "User",
      mockChapa = true,
    } = options;

    const txRef = generateTxRef("CHAPA");

    // Save PENDING payment in DB using enum constant
    const payment = await prisma.payment.create({
      data: {
        userId,
        appointmentId,
        amount,
        currency,
        txRef,
        status: PaymentStatus.PENDING,
      },
    });

    let checkoutUrl: string;

    if (mockChapa) {
      // Mock checkout for testing
      checkoutUrl = `https://checkout.chapa.co/${txRef}`;
    } else {
      const response = await axios.post(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          amount,
          currency,
          email,
          first_name: firstName,
          last_name: lastName,
          tx_ref: txRef,
          callback_url: process.env.CHAPA_CALLBACK_URL,
          return_url:
            process.env.FRONTEND_RETURN_URL ??
            "http://localhost:3000/payment/success",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      checkoutUrl = response.data?.data?.checkout_url;
      if (!checkoutUrl) {
        throw new Error("Failed to receive checkout_url from Chapa");
      }
    }

    return { payment, checkoutUrl };
  }

  /**
   * Verify a payment using Chapa's verify API
   */
  async verifyPayment(txRef: string) {
    try {
      const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        }
      );

      const paymentStatusString = response.data?.data?.status ?? "UNKNOWN";
      const paymentStatus =
        paymentStatusString === "success"
          ? PaymentStatus.SUCCESS
          : PaymentStatus.FAILED;

      await prisma.payment.update({
        where: { txRef },
        data: { status: paymentStatus },
      });

      return paymentStatus;
    } catch (err) {
      let errorMsg = "Payment verification failed";
      if (err instanceof Error) errorMsg = err.message;

      // Use enum constant for error state
      await prisma.payment.updateMany({
        where: { txRef },
        data: { status: PaymentStatus.ERROR },
      });

      return errorMsg;
    }
  }
}

export const paymentService = new PaymentService();
