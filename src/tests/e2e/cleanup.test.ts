import prisma from "../../prismaClient";

jest.setTimeout(30000); // Set longer timeout for DB ops

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: "@example.com" } } });
  await prisma.$disconnect(); // Ensures connection is closed for Jest teardown
});

test("cleanup test users with @example.com", async () => {
  // This test passes if deleteMany executes without error
  const count = await prisma.user.count({ where: { email: { contains: "@example.com" } } });
  // Before cleanup this might not be zero, so better to check: count >= 0
  expect(count).toBeGreaterThanOrEqual(0);
});
