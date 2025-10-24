import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.create({
    data: {
      title: "Hello World",
      url: "https://example.com",
      content: "demo",
      siteKey: "example",
    },
  });
  console.log("Created article:", article);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
