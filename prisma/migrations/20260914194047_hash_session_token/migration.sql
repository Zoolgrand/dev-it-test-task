-- DeleteData
DELETE FROM "Session";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "tokenHash" TEXT NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("tokenHash");
