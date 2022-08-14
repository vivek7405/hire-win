import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteWorkflow = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteWorkflow), resolver.authorize(), async ({ id }) => {
  const workflow = await db.workflow.findUnique({ where: { id } })

  // Don't allow deleting the Default Workflow
  if (workflow?.name?.toLowerCase() === "default") {
    throw new Error("Cannot delete the 'Default' workflow")
  }

  await db.workflowStage.deleteMany({ where: { workflowId: id } })
  const deletedWorkflow = await db.workflow.delete({ where: { id } })

  return deletedWorkflow
})
