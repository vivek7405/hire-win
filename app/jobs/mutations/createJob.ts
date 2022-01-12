import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { Job, JobInputType } from "app/jobs/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createJob(data: JobInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, description, categoryId, workflowId, formId } = Job.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const job = await db.job.create({
    data: {
      name: name,
      description: description!,
      slug: newSlug,
      categoryId: categoryId || null,
      workflowId: workflowId || null,
      formId: formId || null,
      memberships: {
        create: {
          role: "OWNER",
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
    },
  })

  return job
}

export default Guard.authorize("create", "job", createJob)
