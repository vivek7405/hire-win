import { Ctx } from "blitz"
import db, { Prisma } from "db"

import Guard from "app/guard/ability"

type UpdateMembershipInput = Pick<Prisma.MembershipUpdateArgs, "where" | "data">

async function updateMemberRole({ where, data }: UpdateMembershipInput, ctx: Ctx) {
  ctx.session.$authorize()

  const membership = await db.membership.update({
    where,
    data,
  })

  return membership
}

export default Guard.authorize("update", "membership", updateMemberRole)
