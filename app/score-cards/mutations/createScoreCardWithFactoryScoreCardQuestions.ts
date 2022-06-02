import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryScoreCardQuestions from "../../card-questions/utils/factoryScoreCardQuestions"

async function createScoreCardWithFactoryScoreCardQuestions(
  scoreCardName: string,
  companyId: number,
  factoryScoreCard: boolean
) {
  const slugScoreCard = slugify(scoreCardName, { strict: true })
  const newSlugScoreCard = await findFreeSlug(
    slugScoreCard,
    async (e) => await db.scoreCard.findFirst({ where: { slug: e } })
  )

  const getCardQuestionSlug = async (fq) => {
    const slugCardQuestion = slugify(fq.cardQuestion.name, { strict: true })
    const newSlugCardQuestion = await findFreeSlug(
      slugCardQuestion,
      async (e) => await db.cardQuestion.findFirst({ where: { slug: e } })
    )
    fq.cardQuestion.slug = newSlugCardQuestion
  }
  const promises = [] as any
  factoryScoreCardQuestions.forEach(async (fq) => {
    promises.push(getCardQuestionSlug(fq))
  })
  await Promise.all(promises)

  const existingCardQuestions = await db.cardQuestion.findMany({
    where: {
      companyId,
      name: {
        in: factoryScoreCardQuestions.map((fq) => {
          return fq.cardQuestion.name
        }),
      },
    },
  })

  const createScoreCard = await db.scoreCard.create({
    data: {
      createdAt: new Date(),
      updatedAt: new Date(),
      name: scoreCardName,
      slug: newSlugScoreCard,
      factory: factoryScoreCard,
      company: {
        connect: {
          id: companyId,
        },
      },
      cardQuestions: {
        create: factoryScoreCardQuestions.map((fq) => {
          return {
            createdAt: new Date(),
            updatedAt: new Date(),
            order: fq.order,
            cardQuestion: {
              connectOrCreate: {
                where: {
                  id: existingCardQuestions?.find((q) => q.name === fq.cardQuestion.name)?.id || "",
                },
                create: {
                  name: fq.cardQuestion.name || "",
                  slug: fq.cardQuestion.slug || "",
                  factory: fq.cardQuestion.factory || false,
                  company: {
                    connect: {
                      id: companyId,
                    },
                  },
                },
              },
            },
          }
        }),
      },
    },
  })

  return createScoreCard
}

export default createScoreCardWithFactoryScoreCardQuestions
