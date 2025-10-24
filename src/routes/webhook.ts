// routes/webhook.ts

import express from 'express';
import { handleChapaWebhook } from '../controllers/webhookController';

const router = express.Router();

router.post('/payments/webhook', handleChapaWebhook);

export default router;
