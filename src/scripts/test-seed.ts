import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Testing seeded data...");

  const users = await prisma.user.findMany();
  console.log("Users:", users);

  const therapists = await prisma.user.findMany({
    where: { role: "THERAPIST" },
    include: {
      therapistProfile: {
        include: { specializations: { include: { specialization: true } } },
      },
    },
  });
  console.log("Therapists with profiles:", JSON.stringify(therapists, null, 2));

  const articles = await prisma.article.findMany();
  console.log("Articles:", articles);
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
