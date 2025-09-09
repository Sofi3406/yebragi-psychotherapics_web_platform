import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Starting article test...");

 const article = await prisma.article.upsert({
  where: { url: "https://example.com/test-article" },
  update: {},
  create: {
    title: "Test Article",
    content: "This is test content",
    url: "https://example.com/test-article",
  },
});

    console.log("✅ Article created:", article);

    const articles = await prisma.article.findMany();
    console.log("📚 All articles:", articles);

  } catch (error: any) {
    console.error("❌ Error while creating/fetching article:");
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(JSON.stringify(error, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
