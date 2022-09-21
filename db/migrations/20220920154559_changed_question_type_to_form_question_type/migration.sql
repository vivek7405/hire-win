/*
  Warnings:

  - The `type` column on the `FormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FormQuestionType" AS ENUM ('Single_line_text', 'Long_text', 'Attachment', 'Checkbox', 'Multiple_select', 'Single_select', 'Date', 'Phone_number', 'Email', 'URL', 'Number', 'Rating');

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "type",
ADD COLUMN     "type" "FormQuestionType" NOT NULL DEFAULT E'Single_line_text';

-- DropEnum
DROP TYPE "QuestionType";
