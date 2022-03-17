import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where"> & {
  hidden: boolean
}

async function setJobHidden({ where, hidden }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const job = await db.job.update({
    where,
    data: {
      hidden,
    },
  })

  return job
}

export default Guard.authorize("update", "job", setJobHidden)
