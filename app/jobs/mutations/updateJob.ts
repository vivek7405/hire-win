import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where" | "data"> & {
  initial: ExtendedJob
}

async function updateJob({ where, data, initial }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, description, categoryId, workflowId } = Job.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const job = await db.job.update({
    where,
    data: {
      name,
      description: description!,
      categoryId: categoryId || null,
      workflowId: workflowId || null,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return job
}

export default Guard.authorize("update", "job", updateJob)
