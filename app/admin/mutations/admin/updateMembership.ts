import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateMembershipInput = Pick<Prisma.MembershipUpdateArgs, "where" | "data">

async function updateMembership({ where, data }: UpdateMembershipInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const membership = await db.membership.update({
    where,
    data,
  })

  return membership
}

export default updateMembership
