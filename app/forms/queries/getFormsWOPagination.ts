import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetFormsInput extends Pick<Prisma.FormFindManyArgs, "where"> {}

const getFormsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetFormsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const forms = await db.form.findMany({
      where,
      include: {
        questions: { include: { question: true } },
        jobs: true,
      },
    })
    return forms
  }
)

export default Guard.authorize("readAll", "form", getFormsWOPagination)
