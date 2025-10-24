import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

// Bind context to controller methods for class
router.post("/initiate", (req, res) => paymentController.initiate(req, res));
router.post("/webhook", (req, res) => paymentController.webhook(req, res));

export default router;
