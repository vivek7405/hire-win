import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateFormInput = Pick<Prisma.FormUpdateArgs, "where" | "data">

async function updateForm({ where, data }: UpdateFormInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const form = await db.form.update({
    where,
    data,
  })

  return form
}

export default updateForm
