import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteForm = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteForm), resolver.authorize(), async ({ id }) => {
  await db.formQuestion.deleteMany({ where: { formId: id } })
  const form = await db.form.delete({ where: { id } })

  return form
})
