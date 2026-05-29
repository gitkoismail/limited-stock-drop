/*
  Warnings:

  - A unique constraint covering the columns `[activeReservationKey]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "activeReservationKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_activeReservationKey_key" ON "Reservation"("activeReservationKey");
