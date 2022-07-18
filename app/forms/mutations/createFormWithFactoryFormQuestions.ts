import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryFormQuestions from "../../questions/utils/factoryFormQuestions"
import { QuestionType } from "@prisma/client"
import { Ctx } from "blitz"

type InputType = {
  formName: string
  companyId: string
  factoryForm: boolean
}
async function createFormWithFactoryFormQuestions(
  { formName, companyId, factoryForm }: InputType,
  ctx: Ctx
) {
  const slugForm = slugify(formName, { strict: true, lower: true })
  // const newSlugForm = await findFreeSlug(
  //   slugForm,
  //   async (e) => await db.form.findFirst({ where: { slug: e } })
  // )

  const getQuestionSlug = async (fq) => {
    const slugQuestion = slugify(fq.question.name, { strict: true, lower: true })
    // const newSlugQuestion = await findFreeSlug(
    //   slugQuestion,
    //   async (e) => await db.question.findFirst({ where: { slug: e } })
    // )
    fq.question.slug = slugQuestion
  }
  const promises = [] as any
  factoryFormQuestions.forEach(async (fq) => {
    promises.push(getQuestionSlug(fq))
  })
  await Promise.all(promises)

  const existingQuestions = await db.question.findMany({
    where: {
      companyId,
      name: {
        in: factoryFormQuestions.map((fq) => {
          return fq.question.name
        }),
      },
    },
  })

  const createForm = await db.form.create({
    data: {
      createdAt: new Date(),
      updatedAt: new Date(),
      name: formName,
      slug: slugForm,
      factory: factoryForm,
      company: {
        connect: {
          id: companyId,
        },
      },
      questions: {
        create: factoryFormQuestions.map((fq) => {
          return {
            createdAt: new Date(),
            updatedAt: new Date(),
            order: fq.order,
            behaviour: fq.behaviour,
            allowBehaviourEdit: fq.allowBehaviourEdit,
            question: {
              connectOrCreate: {
                where: {
                  id: existingQuestions?.find((q) => q.name === fq.question.name)?.id || "",
                },
                create: {
                  name: fq.question.name || "",
                  type: fq.question.type || QuestionType.Single_line_text,
                  placeholder: fq.question.placeholder || "",
                  acceptedFiles: fq.question.acceptedFiles || "",
                  slug: fq.question.slug || "",
                  factory: fq.question.factory || false,
                  company: {
                    connect: {
                      id: companyId,
                    },
                  },
                  createdBy: {
                    connect: {
                      id: ctx.session.userId || "0",
                    },
                  },
                },
              },
            },
          }
        }),
      },
      createdBy: {
        connect: {
          id: ctx.session.userId || "0",
        },
      },
    },
  })

  return createForm
}

export default createFormWithFactoryFormQuestions
