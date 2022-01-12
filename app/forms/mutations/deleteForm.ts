import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteForm = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteForm), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const Form = await db.form.deleteMany({ where: { id } })

  return Form
})
