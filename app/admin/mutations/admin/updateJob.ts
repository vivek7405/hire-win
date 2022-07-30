import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where" | "data">

async function updateJob({ where, data }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const job = await db.job.update({
    where,
    data,
  })

  return job
}

export default updateJob
