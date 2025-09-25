import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

router.post("/initiate", paymentController.initiate);
router.post("/webhook", paymentController.webhook);

export default router;
