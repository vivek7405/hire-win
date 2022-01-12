import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetQuestion = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

const getQuestion = resolver.pipe(
  resolver.zod(GetQuestion),
  resolver.authorize(),
  async ({ slug }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const question = await db.question.findFirst({
      where: { slug },
      include: { forms: true, options: true },
    })

    if (!question) throw new NotFoundError()

    return question
  }
)

export default Guard.authorize("read", "question", getQuestion)
