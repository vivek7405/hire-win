import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetFormsInput extends Pick<Prisma.FormFindManyArgs, "where"> {}

const getFormsWOPaginationWOAbility = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetFormsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const forms = await db.form.findMany({
      where,
      include: {
        questions: { include: { question: true }, orderBy: { order: "asc" } },
        jobs: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
    return forms
  }
)

export default getFormsWOPaginationWOAbility
