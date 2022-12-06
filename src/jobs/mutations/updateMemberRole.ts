import { Ctx } from "blitz"
import db, { Prisma } from "db"

import Guard from "src/guard/ability"

type UpdateMembershipInput = Pick<Prisma.JobUserUpdateArgs, "where" | "data">

async function updateMemberRole({ where, data }: UpdateMembershipInput, ctx: Ctx) {
  ctx.session.$authorize()

  const jobUser = await db.jobUser.update({
    where,
    data,
  })

  return jobUser
}

export default Guard.authorize("update", "membership", updateMemberRole)
