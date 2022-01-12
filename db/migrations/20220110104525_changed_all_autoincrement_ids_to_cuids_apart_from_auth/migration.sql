/*
  Warnings:

  - The primary key for the `Answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FormQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WorkflowStage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Answer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Answer_id_seq";

-- AlterTable
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FormQuestion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FormQuestion_id_seq";

-- AlterTable
ALTER TABLE "WorkflowStage" DROP CONSTRAINT "WorkflowStage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WorkflowStage_id_seq";
