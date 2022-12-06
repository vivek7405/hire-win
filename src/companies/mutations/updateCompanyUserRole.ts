import { Ctx } from "blitz"
import db, { CompanyUserRole, JobUserRole, Prisma } from "db"

import Guard from "src/guard/ability"

type UpdateCompanyUserInput = Pick<Prisma.CompanyUserUpdateArgs, "where" | "data">

async function updateCompanyUserRole({ where, data }: UpdateCompanyUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const currentCompanyUser = await db.companyUser.findFirst({ where })
  const updatedCompanyUser = await db.companyUser.update({ where, data })

  // If role is downgraded, transfer all job ownerships from the member to company owner
  if (
    currentCompanyUser?.role === CompanyUserRole.ADMIN &&
    updatedCompanyUser?.role === CompanyUserRole.USER
  ) {
    // Find jobs owned by user and change the job role from owner to admin
    const jobUsersWhereOwner = await db.jobUser.findMany({
      where: {
        userId: currentCompanyUser.userId,
        role: JobUserRole.OWNER,
      },
    })
    if (jobUsersWhereOwner) {
      await db.jobUser.updateMany({
        where: {
          id: { in: jobUsersWhereOwner.map((ju) => ju.id) },
        },
        data: {
          role: JobUserRole.ADMIN,
        },
      })
      const companyUserOwner = await db.companyUser.findFirst({
        where: {
          companyId: currentCompanyUser.companyId,
          role: CompanyUserRole.OWNER,
        },
      })
      // transfer ownership of all those jobs to company owner
      await db.jobUser.updateMany({
        where: {
          userId: companyUserOwner?.userId,
          jobId: { in: jobUsersWhereOwner.map((ju) => ju.jobId) },
        },
        data: {
          role: JobUserRole.OWNER,
        },
      })
    }
  }

  return updatedCompanyUser
}

export default updateCompanyUserRole
// export default Guard.authorize("update", "companyUser", updateCompanyUserRole)
