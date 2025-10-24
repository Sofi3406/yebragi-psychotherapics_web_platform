// scripts/listArticles.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany();
  console.log(articles);
}

main().finally(() => prisma.$disconnect());
