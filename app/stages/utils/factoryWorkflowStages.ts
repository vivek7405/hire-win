import { Stage } from "@prisma/client"
import { ExtendedWorkflowStage } from "types"

const factoryWorkflowStages = [
  {
    order: 1,
    stage: {
      name: "Sourced",
      allowEdit: false,
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 2,
    stage: {
      name: "Shortlisted",
      allowEdit: true,
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 3,
    stage: {
      name: "Interview",
      allowEdit: true,
    } as Stage,
  } as ExtendedWorkflowStage,
  {
    order: 4,
    stage: {
      name: "Hired",
      allowEdit: false,
    } as Stage,
  } as ExtendedWorkflowStage,
]

export default factoryWorkflowStages
