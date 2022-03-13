import { Stage } from "@prisma/client"
import { ExtendedWorkflowStage } from "types"

const factoryWorkflowStages = [
  {
    order: 1,
    allowEdit: false,
    stage: {
      name: "Sourced",
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 2,
    allowEdit: true,
    stage: {
      name: "Shortlisted",
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 3,
    allowEdit: true,
    stage: {
      name: "Interview",
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 4,
    allowEdit: false,
    stage: {
      name: "Hired",
    } as Stage,
  } as ExtendedWorkflowStage,
]

export default factoryWorkflowStages
