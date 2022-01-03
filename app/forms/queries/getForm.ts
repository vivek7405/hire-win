import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetForm = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

const getForm = resolver.pipe(resolver.zod(GetForm), resolver.authorize(), async ({ slug }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const form = await db.form.findFirst({ where: { slug }, include: { questions: true } })

  if (!form) throw new NotFoundError()

  return form
})

export default Guard.authorize("read", "form", getForm)
