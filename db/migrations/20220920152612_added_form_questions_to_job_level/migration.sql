/*
  Warnings:

  - You are about to drop the column `formId` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,questionId]` on the table `FormQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,questionId,order]` on the table `FormQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_createdById_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_formId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_formId_fkey";

-- DropIndex
DROP INDEX "FormQuestion_formId_questionId_key";

-- DropIndex
DROP INDEX "FormQuestion_formId_questionId_order_key";

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "formId",
ADD COLUMN     "jobId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Form";

-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_jobId_questionId_key" ON "FormQuestion"("jobId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_jobId_questionId_order_key" ON "FormQuestion"("jobId", "questionId", "order");

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
