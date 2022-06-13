import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import moment from "moment"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where"> & {
  archived: boolean
}

async function setJobArchived({ where, archived }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const job = await db.job.update({
    where,
    data: archived
      ? {
          archived,
          validThrough: moment().utc().toDate(),
        }
      : { archived },
  })

  return job
}

export default Guard.authorize("update", "job", setJobArchived)
