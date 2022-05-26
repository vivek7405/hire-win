import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryWorkflowStages from "../../stages/utils/factoryWorkflowStages"

async function createWorkflowWithFactoryWorkflowStages(workflowName: string, companyId: number) {
  const slugWorkflow = slugify(workflowName, { strict: true })
  const newSlugWorkflow = await findFreeSlug(
    slugWorkflow,
    async (e) => await db.workflow.findFirst({ where: { slug: e } })
  )

  const getStageSlug = async (fq) => {
    const slugStage = slugify(fq.stage.name, { strict: true })
    const newSlugStage = await findFreeSlug(
      slugStage,
      async (e) => await db.stage.findFirst({ where: { slug: e } })
    )
    fq.stage.slug = newSlugStage
  }
  const promises = [] as any
  factoryWorkflowStages.forEach(async (fq) => {
    promises.push(getStageSlug(fq))
  })
  await Promise.all(promises)

  const existingStages = await db.stage.findMany({
    where: {
      companyId,
      name: {
        in: factoryWorkflowStages.map((fq) => {
          return fq.stage.name
        }),
      },
    },
  })

  const createWorkflow = await db.workflow.create({
    data: {
      createdAt: new Date(),
      updatedAt: new Date(),
      name: workflowName,
      slug: newSlugWorkflow,
      company: {
        connect: {
          id: companyId,
        },
      },
      stages: {
        create: factoryWorkflowStages.map((fq) => {
          return {
            createdAt: new Date(),
            updatedAt: new Date(),
            order: fq.order,
            stage: {
              connectOrCreate: {
                where: {
                  id: existingStages?.find((q) => q.name === fq.stage.name)?.id || "",
                },
                create: {
                  name: fq.stage.name || "",
                  slug: fq.stage.slug || "",
                  allowEdit: fq.stage.allowEdit,
                  company: {
                    connect: {
                      id: companyId,
                    },
                  },
                },
              },
            },
          }
        }),
      },
    },
  })

  return createWorkflow
}

export default createWorkflowWithFactoryWorkflowStages
