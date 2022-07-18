import createFactoryCandidatePools from "app/candidate-pools/mutations/createFactoryCandidatePools"
import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createFactoryEmailTemplates from "app/email-templates/mutations/createFactoryEmailTemplates"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import { Ctx } from "blitz"

type InputType = {
  companyId: string
}
const createFactoryItems = async ({ companyId }: InputType, ctx: Ctx) => {
  await createFactoryCategories(companyId, ctx)

  await createWorkflowWithFactoryWorkflowStages(
    { workflowName: "Default", companyId, factoryWorkflow: true },
    ctx
  )

  await createFormWithFactoryFormQuestions(
    { formName: "Default", companyId, factoryForm: true },
    ctx
  )

  await createScoreCardWithFactoryScoreCardQuestions(
    { scoreCardName: "Default", companyId, factoryScoreCard: true },
    ctx
  )

  await createFactoryEmailTemplates({ companyId }, ctx)

  await createFactoryCandidatePools({ companyId }, ctx)
}

export default createFactoryItems
