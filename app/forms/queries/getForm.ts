import Guard from "app/guard/ability"
import { resolver, NotFoundError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

// const GetForm = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetFormInput extends Pick<Prisma.FormFindFirstArgs, "where"> {}

const getForm = resolver.pipe(resolver.authorize(), async ({ where }: GetFormInput, ctx: Ctx) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const form = await db.form.findFirst({ where, include: { questions: true } })

  if (!form) throw new NotFoundError()

  return form
})

export default Guard.authorize("read", "form", getForm)
