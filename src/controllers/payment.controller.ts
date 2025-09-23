import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export class PaymentController {
  async initiate(req: Request, res: Response) {
    const { appointmentId, amount } = req.body;
    const result = await paymentService.initiatePayment(appointmentId, amount);
    return res.status(201).json(result);
  }

  async webhook(req: Request, res: Response) {
    // Save raw webhook data for workers to verify later
    const payload = req.body;
    // Normally, you'd enqueue a JobRecord here
    console.log("Webhook received:", payload);

    return res.status(202).json({ message: "Webhook received" });
  }
}

export const paymentController = new PaymentController();
