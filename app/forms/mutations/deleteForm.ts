import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteForm = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteForm), resolver.authorize(), async ({ id }) => {
  const form = await db.form.findUnique({ where: { id } })

  // Don't allow deleting the Default Form
  if (form?.name?.toLowerCase() === "default") {
    throw new Error("Cannot delete the 'Default' form")
  }

  await db.formQuestion.deleteMany({ where: { formId: id } })
  const deletedForm = await db.form.delete({ where: { id } })

  return deletedForm
})
