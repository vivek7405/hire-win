import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { FormObj, FormInputType } from "app/forms/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createFormQuestion from "./createFormQuestion"

async function createForm(data: FormInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = FormObj.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.form.findFirst({ where: { slug: e } })
  )

  const form = await db.form.create({
    data: {
      name: name,
      slug: newSlug,
      userId: user.id,
    },
  })

  return form
}

export default Guard.authorize("create", "form", createForm)
