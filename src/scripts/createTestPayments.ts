import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const payments = [
    {
      userId: "test-user-1",
      amount: 100.0,
      currency: "USD",
      txRef: "tx-init-001",
      status: PaymentStatus.INITIATED,
      checkoutUrl: "https://dummy-checkout/init-001",
    },
    {
      userId: "test-user-2",
      amount: 80.0,
      currency: "USD",
      txRef: "tx-pending-002",
      status: PaymentStatus.PENDING,
      checkoutUrl: "https://dummy-checkout/pending-002",
    },
    {
      userId: "test-user-3",
      amount: 120.0,
      currency: "USD",
      txRef: "tx-error-003",
      status: PaymentStatus.ERROR,
      checkoutUrl: "https://dummy-checkout/error-003",
    },
  ];

  for (const payment of payments) {
    const created = await prisma.payment.create({ data: payment });
    console.log("Created payment:", created);
  }
}

main().finally(() => prisma.$disconnect());
