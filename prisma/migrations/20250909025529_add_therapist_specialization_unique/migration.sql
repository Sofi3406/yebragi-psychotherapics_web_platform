/*
  Warnings:

  - A unique constraint covering the columns `[therapistProfileId,specializationId]` on the table `TherapistSpecialization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TherapistSpecialization_therapistProfileId_specializationId_key" ON "public"."TherapistSpecialization"("therapistProfileId", "specializationId");
