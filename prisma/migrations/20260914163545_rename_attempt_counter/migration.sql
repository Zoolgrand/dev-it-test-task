/*
  Warnings:

  - You are about to drop the `LoginAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LoginAttempt";

-- CreateTable
CREATE TABLE "AttemptCounter" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttemptCounter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "AttemptCounter_resetAt_idx" ON "AttemptCounter"("resetAt");
