-- CreateEnum
CREATE TYPE "RatingValue" AS ENUM ('VERY_POOR', 'POOR', 'AVERAGE', 'GOOD', 'VERY_GOOD');

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardQuestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "factory" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CardQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreCardQuestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "scoreId" TEXT NOT NULL,
    "cardQuestionId" TEXT NOT NULL,

    CONSTRAINT "ScoreCardQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" "RatingValue" NOT NULL,
    "cardQuestionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_slug_key" ON "Score"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_name_key" ON "Score"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CardQuestion_slug_key" ON "CardQuestion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CardQuestion_userId_name_key" ON "CardQuestion"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_scoreId_cardQuestionId_key" ON "ScoreCardQuestion"("scoreId", "cardQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_scoreId_cardQuestionId_order_key" ON "ScoreCardQuestion"("scoreId", "cardQuestionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_candidateId_cardQuestionId_key" ON "Rating"("candidateId", "cardQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_candidateId_cardQuestionId_value_key" ON "Rating"("candidateId", "cardQuestionId", "value");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardQuestion" ADD CONSTRAINT "CardQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_cardQuestionId_fkey" FOREIGN KEY ("cardQuestionId") REFERENCES "CardQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_cardQuestionId_fkey" FOREIGN KEY ("cardQuestionId") REFERENCES "CardQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
