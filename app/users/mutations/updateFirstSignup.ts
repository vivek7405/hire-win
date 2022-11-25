import { Ctx } from "blitz"
import db from "db"

type UpdateFirstSignupType = {
  userId: string
  isFirstSignup: boolean
}

async function updateFirstSignup({ userId, isFirstSignup }: UpdateFirstSignupType, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.update({
    where: { id: userId },
    data: { isFirstSignup: isFirstSignup },
  })

  return user
}

export default updateFirstSignup
