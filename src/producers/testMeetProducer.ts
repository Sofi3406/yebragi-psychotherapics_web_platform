import prisma from "../prismaClient";
import { createQueue } from "../config/redis";

async function main() {
  // 1️⃣ Create or find a fake patient
  let patient = await prisma.user.findFirst({
    where: { email: "testpatient@example.com" },
  });

  if (!patient) {
    patient = await prisma.user.create({
      data: {
        name: "Test Patient",
        email: "testpatient@example.com",
        password: "hashedpassword123", // or mock value
        role: "PATIENT", // make sure this matches your schema enum
      },
    });
    console.log(`🆕 Created test patient with ID: ${patient.id}`);
  } else {
    console.log(`✅ Found existing test patient with ID: ${patient.id}`);
  }

  // 2️⃣ Create a test appointment linked to that patient
  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(),
      status: "PENDING", // adjust if your model uses something else
      patientId: patient.id, // ✅ link the patient here
    },
  });

  console.log(`🆕 Created test appointment with ID: ${appointment.id}`);

  // 3️⃣ Add job to queue
  const meetQueue = createQueue("meet-creation");
  await meetQueue.add("create-meet", { appointmentId: appointment.id });

  console.log("✅ Test meet job added to queue!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
