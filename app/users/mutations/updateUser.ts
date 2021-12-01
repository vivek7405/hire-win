import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { User } from "app/users/validations"
import Guard from "app/guard/ability"

type UpdateUserInput = Pick<Prisma.UserUpdateArgs, "where" | "data">

async function updateUser({ where, data }: UpdateUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { avatar } = User.parse(data) as any

  const user = await db.user.update({
    where,
    data: {
      avatar,
    },
  })

  return user
}
export default Guard.authorize("update", "user", updateUser)
