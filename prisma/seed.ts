import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Example user (patient)
  const user = await prisma.user.upsert({
    where: { email: "patient@gmail.com" },
    update: {},
    create: {
      email: "patient@gmail.com",
      password: "hashedpassword",
      fullName: "John Doe",
      role: "PATIENT",
    },
  });

  // Example therapist with profile
  const therapistUser = await prisma.user.upsert({
    where: { email: "therapist@gmail.com" },
    update: {},
    create: {
      email: "therapist@gmail.com", 
      password: "hashedpassword",
      fullName: "Dr. Sofiya Yasin",
      role: "THERAPIST",
      therapistProfile: {
        create: {
          bio: "Experienced psychotherapist specializing in CBT.",
          licenseNumber: "THERAPY-12345",
        },
      },
    },
    include: {
      therapistProfile: true, 
    },
  });

  // Example specialization
  const specialization = await prisma.specialization.upsert({
    where: { name: "Cognitive Behavioral Therapy" },
    update: {},
    create: {
      name: "Cognitive Behavioral Therapy",
      description: "A type of psychotherapy focused on thoughts and behaviors.",
    },
  });

  // Link therapist to specialization
  await prisma.therapistSpecialization.upsert({
    where: {
      therapistProfileId_specializationId: {
        therapistProfileId: therapistUser.therapistProfile!.id,
        specializationId: specialization.id,
      },
    },
    update: {},
    create: {
      therapistProfileId: therapistUser.therapistProfile!.id,
      specializationId: specialization.id,
    },
  });

  // Example article
  await prisma.article.upsert({
    where: { url: "https://yebragi.com/welcome" },
    update: {},
    create: {
      title: "Welcome to Yebragi",
      content: "This is the first seed article for our psychotherapy platform.",
      url: "https://yebragi.com/welcome",
    },
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
