-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PATIENT', 'THERAPIST', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TherapistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Specialization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TherapistSpecialization" (
    "id" TEXT NOT NULL,
    "therapistProfileId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,

    CONSTRAINT "TherapistSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TherapistProfile_userId_key" ON "public"."TherapistProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_key" ON "public"."Specialization"("name");

-- AddForeignKey
ALTER TABLE "public"."TherapistProfile" ADD CONSTRAINT "TherapistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistSpecialization" ADD CONSTRAINT "TherapistSpecialization_therapistProfileId_fkey" FOREIGN KEY ("therapistProfileId") REFERENCES "public"."TherapistProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistSpecialization" ADD CONSTRAINT "TherapistSpecialization_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "public"."Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
