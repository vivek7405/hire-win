-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "visibleOnlyToParentMembers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ParentCompany" ADD COLUMN     "newCandidatesVisibleOnlyToParentMembers" BOOLEAN NOT NULL DEFAULT false;
