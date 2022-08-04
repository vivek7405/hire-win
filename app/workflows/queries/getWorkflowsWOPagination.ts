import Guard from "app/guard/ability"
import getWorkflowsWOPaginationWOAbility from "./getWorkflowsWOPaginationWOAbility"

export default Guard.authorize("readAll", "workflow", getWorkflowsWOPaginationWOAbility)
