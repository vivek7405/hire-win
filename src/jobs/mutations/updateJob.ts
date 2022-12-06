import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma, SalaryType } from "db"
import { Job } from "src/jobs/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import moment from "moment"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where" | "data"> & {
  initial: ExtendedJob
}

async function updateJob({ where, data, initial }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const {
    id,
    title,
    description,
    categoryId,
    // workflowId,
    // formId,
    country,
    state,
    city,
    remoteOption,
    postToGoogle,
    currency,
    minSalary,
    maxSalary,
    salaryType,
    showSalary,
    employmentType,
    // validThrough,
    // scoreCards,
  } = Job.parse(data)

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(title, { strict: true, lower: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) =>
      await db.job.findFirst({ where: { slug: e, companyId: ctx.session.companyId || "0" } }),
    500
  )

  const job = await db.job.update({
    where,
    data: {
      title,
      slug: initial.title !== title ? newSlug : initial.slug,
      description,
      categoryId: categoryId || null,
      // workflowId: workflowId || null,
      // formId: formId || null,
      country,
      state,
      city,
      remoteOption,
      postToGoogle,
      currency: currency || "",
      minSalary: minSalary || 0,
      maxSalary: maxSalary || 0,
      salaryType: salaryType || SalaryType.YEAR,
      showSalary,
      employmentType,
      // validThrough: moment(validThrough || undefined)
      //   .utc()
      //   .toDate(),
      // scoreCards: {
      //   delete: initial?.scoreCards?.map((sc) => {
      //     return { id: sc.id }
      //   }),
      //   upsert: scoreCards?.map((sc) => {
      //     return {
      //       create: { scoreCardId: sc.scoreCardId, workflowStageId: sc.workflowStageId },
      //       update: { scoreCardId: sc.scoreCardId, workflowStageId: sc.workflowStageId },
      //       where: { id: sc.id || "" },
      //     }
      //   }),
      // },
    },
  })

  return job
}

export default updateJob
