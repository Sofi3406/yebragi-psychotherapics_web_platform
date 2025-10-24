import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyWithChapa(txRef: string) {
  // Replace with real API logic or keep as mock
  return Math.random() > 0.5 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
}

async function main() {
  const payments = await prisma.payment.findMany({
    where: {
      status: {
        in: [PaymentStatus.INITIATED, PaymentStatus.PENDING, PaymentStatus.ERROR] // List only valid enums!
      }
    }
  });

  for (const payment of payments) {
    const newStatus = await verifyWithChapa(payment.txRef);
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus }
    });
    console.log(`TxRef ${payment.txRef}: ${payment.status} → ${updated.status}`);
  }
}

main().finally(() => prisma.$disconnect());
