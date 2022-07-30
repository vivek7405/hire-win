import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateUserInput = Pick<Prisma.UserUpdateArgs, "where" | "data">

async function updateUser({ where, data }: UpdateUserInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const user = await db.user.update({
    where,
    data,
  })

  return user
}

export default updateUser
