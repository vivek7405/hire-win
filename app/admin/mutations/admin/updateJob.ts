import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Job } from "db"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where" | "data"> & {
  initial: Job
}

async function updateJob({ where, data, initial }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const slug = slugify(`${data.title}`, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const job = await db.job.update({
    where,
    data: {
      ...data,
      slug: initial.title !== data.title ? newSlug : initial.slug,
    },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })

  return job
}

export default updateJob
