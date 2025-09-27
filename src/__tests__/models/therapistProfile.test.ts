import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("TherapistProfile Model", () => {
  let user: any;

  beforeAll(async () => {
    // Create a dummy user to attach profile
    user = await prisma.user.create({
      data: {
        email: "therapist@test.com",
        password: "hashedpassword123",
        fullName: "Test Therapist",   // ✅ required field
      },
    });
  });

  afterAll(async () => {
    await prisma.therapistProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("should create a therapist profile with valid data", async () => {
    const profile = await prisma.therapistProfile.create({
      data: {
        userId: user.id,
        bio: "Experienced therapist specializing in CBT.",
        licenseNumber: "ABC12345",
      },
    });

    expect(profile).toHaveProperty("id");
    expect(profile.userId).toBe(user.id);
    expect(profile.bio).toBe("Experienced therapist specializing in CBT.");
    expect(profile.licenseNumber).toBe("ABC12345");
  });

  it("should fail to create profile without required user relation", async () => {
    await expect(
      prisma.therapistProfile.create({
        data: {
          // userId missing
          bio: "Should fail",
        } as any,
      })
    ).rejects.toThrow();
  });
});
