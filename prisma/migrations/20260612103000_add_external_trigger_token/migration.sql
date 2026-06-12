-- AlterTable
ALTER TABLE "ClipTarget" ADD COLUMN "externalTriggerToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ClipTarget_externalTriggerToken_key" ON "ClipTarget"("externalTriggerToken");
