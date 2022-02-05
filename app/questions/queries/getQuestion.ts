import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

// const GetQuestion = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetQuestionInput extends Pick<Prisma.QuestionFindFirstArgs, "where"> {}

const getQuestion = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetQuestionInput, ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const question = await db.question.findFirst({
      where,
      include: { forms: true, options: true },
    })

    if (!question) throw new NotFoundError()

    return question
  }
)

export default Guard.authorize("read", "question", getQuestion)
