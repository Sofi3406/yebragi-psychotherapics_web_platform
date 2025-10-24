-- AlterTable
ALTER TABLE "public"."Article" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewStatus" TEXT;
