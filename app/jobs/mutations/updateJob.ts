import { AuthenticationError, Ctx } from "blitz"
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

  const {
    title,
    description,
    categoryId,
    workflowId,
    formId,
    country,
    state,
    city,
    remote,
    currency,
    minSalary,
    maxSalary,
    salaryType,
    employmentType,
    validThrough,
  } = Job.parse(data)

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(title, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const job = await db.job.update({
    where,
    data: {
      title,
      slug: initial.title !== title ? newSlug : initial.slug,
      description,
      categoryId: categoryId || null,
      workflowId: workflowId || null,
      formId: formId || null,
      country,
      state,
      city,
      remote,
      currency,
      minSalary,
      maxSalary,
      salaryType,
      employmentType,
      validThrough,
    },
  })

  return job
}

export default Guard.authorize("update", "job", updateJob)
