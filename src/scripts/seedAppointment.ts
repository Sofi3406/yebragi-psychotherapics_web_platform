import prisma from "../prismaClient";

async function main() {
  // 1. Create or reuse a patient
  const patient = await prisma.user.upsert({
    where: { email: "patient@example.com" },
    update: {},
    create: {
      email: "patient@example.com",
      password: "hashedPassword123",
      fullName: "Demo Patient",
      role: "PATIENT",
    },
  });

  // 2. Create or reuse a therapist + profile
  const therapistUser = await prisma.user.upsert({
    where: { email: "therapist@example.com" },
    update: {},
    create: {
      email: "therapist@example.com",
      password: "hashedPassword123",
      fullName: "Demo Therapist",
      role: "THERAPIST",
    },
  });

  const therapistProfile = await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: {},
    create: { userId: therapistUser.id, bio: "Licensed Clinical Therapist" },
  });

  // 3. Create or reuse an available slot
  const slot = await prisma.availabilitySlot.create({
    data: {
      therapistId: therapistProfile.id,
      startTime: new Date(Date.now() + 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });

  // 4. Finally create appointment
  const appointment = await prisma.appointment.create({
    data: {
      
      patientId: patient.id,
      therapistId: therapistProfile.id,
      slotId: slot.id,
      status: "PENDING",
    },
  });

  console.log("✅ Appointment seeded successfully:", appointment.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
