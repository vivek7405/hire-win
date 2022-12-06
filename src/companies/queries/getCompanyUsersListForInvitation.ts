import Guard from "src/guard/ability"
import { Ctx } from "blitz";
import db, { Prisma } from "db"

async function getCompanyUsersListForInvitation({ jobId }, ctx: Ctx) {
  ctx.session.$authorize()

  const jobUsers = await db.jobUser?.findMany({
    where: { jobId },
  })
  const companyUsers = await db.companyUser.findMany({
    where: {
      companyId: ctx.session?.companyId,
      userId: {
        not: ctx.session.userId || "0",
        notIn: jobUsers?.map((ju) => ju.userId),
      },
    },
    include: { company: true, user: true },
  })

  return companyUsers
}

export default getCompanyUsersListForInvitation
