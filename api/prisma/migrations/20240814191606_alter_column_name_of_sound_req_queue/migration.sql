/*
  Warnings:

  - You are about to drop the column `createdAt` on the `SoundReqQueue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SoundReqQueue" DROP COLUMN "createdAt",
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
