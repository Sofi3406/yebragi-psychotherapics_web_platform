// utils/idempotency.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function isWebhookIdempotent(tx_ref: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({ where: { txRef: tx_ref } });
  // Only process if not already confirmed SUCCESS
  return !payment || payment.status !== 'SUCCESS';
}
