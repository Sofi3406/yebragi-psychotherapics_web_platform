// services/webhookService.ts

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function verifyChapaTx(tx_ref: string) {
  // Replace with real Chapa verify endpoint and secret key
  const CHAPA_SECRET = process.env.CHAPA_SECRET;
  const chapaUrl = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
  try {
    const { data } = await axios.get(chapaUrl, {
      headers: { Authorization: `Bearer ${CHAPA_SECRET}` },
    });

    if (data.status === 'success') {
      // Update DB Payment record
      await prisma.payment.update({
        where: { txRef: tx_ref },
        data: { status: 'SUCCESS' },
      });
      return { status: 'success', updated: true };
    } else {
      return { status: 'failed', reason: data.message };
    }
  } catch (err) {
  let errorMsg = 'Unknown error';
  if (err instanceof Error) {
    errorMsg = err.message;
  }
  return { status: 'error', error: errorMsg };
}
}
