import prisma from "../prismaClient";
import { generateTxRef } from "../utils/txRef";
import axios from "axios";

export class PaymentService {
  /**
   * Initialize a payment with Chapa
   * @param appointmentId The appointment to link this payment to
   * @param amount The payment amount in ETB
   * @param mockChapa If true, mock Chapa API (for testing)
   */
  async initiatePayment(
    appointmentId: string,
    amount: number,
    mockChapa = true
  ) {
    const txRef = generateTxRef("CHAPA");

    // Save INITIATED payment in DB
    const payment = await prisma.payment.create({
      data: {
        appointmentId, // ✅ FIXED: Payment must be linked to Appointment
        amount,
        txRef,
        status: "PENDING",
      },
    });

    let checkoutUrl: string;

    if (mockChapa) {
      // ✅ Mock mode (useful for Jest tests)
      checkoutUrl = `https://checkout.chapa.co/${txRef}`;
    } else {
      // ✅ Real Chapa API call
      const response = await axios.post(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          amount,
          currency: "ETB",
          email: "customer@example.com", // TODO: replace with real user email from appointment.patient
          first_name: "Yebragi",
          last_name: "User",
          tx_ref: txRef,
          callback_url: process.env.CHAPA_CALLBACK_URL,
          return_url: process.env.FRONTEND_RETURN_URL || "http://localhost:3000/payment/success",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      checkoutUrl = response.data.data.checkout_url;
    }

    return { payment, checkoutUrl };
  }

  /**
   * Verify payment status from Chapa and update DB
   * @param txRef Transaction reference
   */
  async verifyPayment(txRef: string) {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const status = response.data.data.status;

    // Update Payment record with latest status
    await prisma.payment.update({
      where: { txRef },
      data: { status },
    });

    return status;
  }
}

export const paymentService = new PaymentService();
