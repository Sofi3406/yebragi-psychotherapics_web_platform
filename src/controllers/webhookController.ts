// controllers/webhookController.ts

import { webhookQueue } from '../queue/connection';
import { isWebhookIdempotent } from '../utils/idempotency';

export async function handleChapaWebhook(req, res) {
  const { tx_ref } = req.body;

  // Avoid duplicate processing
  if (!(await isWebhookIdempotent(tx_ref))) {
    return res.status(200).json({ message: 'Duplicate webhook ignored' });
  }

  await webhookQueue.add('verifyTransaction', { tx_ref });

  return res.status(202).json({ message: 'Webhook queued for verification' });
}
