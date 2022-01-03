-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "hidden" SET DEFAULT false,
ALTER COLUMN "info" SET DEFAULT E'',
ALTER COLUMN "placeholder" SET DEFAULT E'',
ALTER COLUMN "required" SET DEFAULT false;
