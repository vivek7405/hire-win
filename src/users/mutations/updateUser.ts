import { Ctx } from "blitz"
import db, { Prisma, User } from "db"
import { UserObj } from "src/users/validations"
import Guard from "src/guard/ability"

type UpdateUserInput = Pick<Prisma.UserUpdateArgs, "where" | "data"> & {
  initial: User
}

async function updateUser({ where, data, initial }: UpdateUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, email, jobBoardName } = UserObj.parse(data) as any

  const user = await db.user.update({
    where,
    data: { name, email, jobBoardName },
  })

  return user
}
export default Guard.authorize("update", "user", updateUser)
