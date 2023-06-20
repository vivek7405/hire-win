import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Job } from "src/jobs/validations"
import { z } from "zod"

type UpdateJobDescriptionInput = Pick<Prisma.JobUpdateArgs, "where" | "data">

async function updateJobDescription({ where, data }: UpdateJobDescriptionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { description } = z.object({ description: z.string().optional() }).parse(data)

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const job = await db.job.update({
    where,
    data: { description },
  })

  return job
}

export default updateJobDescription
