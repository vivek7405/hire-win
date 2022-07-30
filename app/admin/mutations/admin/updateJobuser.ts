import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateJobuserInput = Pick<Prisma.JobUserUpdateArgs, "where" | "data">

async function updateJobuser({ where, data }: UpdateJobuserInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const jobuser = await db.jobUser.update({
    where,
    data,
  })

  return jobuser
}

export default updateJobuser
