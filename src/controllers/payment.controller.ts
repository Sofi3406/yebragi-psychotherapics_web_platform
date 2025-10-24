import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export class PaymentController {
  /**
   * Initiate payment and return checkoutUrl + payment record
   * Temporary: Uses hardcoded userId until auth middleware is implemented
   */
  async initiate(req: Request, res: Response) {
    try {
      // Temporary hardcoded user ID (replace later with req.user.id)
      const userId = "mh2la2u10000v5jk70cc9vu";

      const {
        appointmentId,
        amount,
        email,
        currency,
        firstName,
        lastName,
        mockChapa,
      } = req.body;

      // Validate required fields
      if (!appointmentId || !amount || !email || !currency) {
        return res.status(400).json({
          message:
            "Missing required fields: appointmentId, amount, email, currency",
        });
      }

      // Call payment service
      const result = await paymentService.initiatePayment({
        userId,
        appointmentId,
        amount,
        email,
        currency,
        firstName,
        lastName,
        mockChapa: !!mockChapa,
      });

      return res.status(201).json(result);
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Internal server error";
      console.error("💥 Payment initiation failed:", errMsg);
      return res.status(500).json({ message: errMsg });
    }
  }

  /**
   * Accept webhook POST, store raw data for later verification
   */
  async webhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      console.log("🔔 Payment webhook received:", JSON.stringify(payload, null, 2));
      return res.status(202).json({ message: "Webhook received" });
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Internal server error";
      console.error("💥 Webhook handling failed:", errMsg);
      return res.status(500).json({ message: errMsg });
    }
  }
}

export const paymentController = new PaymentController();
