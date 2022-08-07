import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteWorkflow = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteWorkflow), resolver.authorize(), async ({ id }) => {
  await db.workflowStage.deleteMany({ where: { workflowId: id } })
  const workflow = await db.workflow.delete({ where: { id } })

  return workflow
})
