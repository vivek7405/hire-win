// import { Ctx, AuthenticationError } from "blitz"
// import db from "db"
// import { WorkflowStage, WorkflowStageInputType } from "app/workflows/validations"
// import Guard from "app/guard/ability"
// import shiftJobStage from "./shiftJobStage"
// import { StageObj } from "app/stages/validations"

// async function createWorkflowStage(data: WorkflowStageInputType, ctx: Ctx) {
//   ctx.session.$authorize()

//   const { jobId, id } = StageObj.parse(data)
//   const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
//   if (!user) throw new AuthenticationError()

//   const order = (await db.stage.count({ where: { jobId: workflowId } })) + 1

//   // Add stage to the last position
//   const workflowStage = await db.stage.create({
//     data: {
//       order: order,
//       workflowId: workflowId!,
//       stageId: stageId,
//     },
//   })

//   // After adding stage to the last position, shift it up
//   await shiftWorkflowStage(
//     { workflowId: workflowId!, sourceOrder: order, destOrder: order - 1 },
//     ctx
//   )

//   return workflowStage
// }

// export default Guard.authorize("create", "workflowStage", createWorkflowStage)

export default function createJobStage() {}
