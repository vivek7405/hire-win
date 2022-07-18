import { Ctx } from "blitz"
import db, { Form, Prisma } from "db"
import { FormObj } from "app/forms/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateFormInput = Pick<Prisma.FormUpdateArgs, "where" | "data"> & {
  initial: Form
}

async function updateForm({ where, data, initial }: UpdateFormInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = FormObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.form.findFirst({ where: { slug: e } })
  // )

  const form = await db.form.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return form
}

export default Guard.authorize("update", "form", updateForm)
