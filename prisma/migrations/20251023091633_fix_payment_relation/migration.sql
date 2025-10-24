/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Appointment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Appointment_paymentId_key";

-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "paymentId";
