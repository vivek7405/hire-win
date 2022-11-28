import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createFactoryEmailTemplates from "app/email-templates/mutations/createFactoryEmailTemplates"
import createFactoryCandidatePools from "app/candidate-pools/mutations/createFactoryCandidatePools"
// import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
// import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
// import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import { Ctx } from "blitz"
import createFactoryJob from "app/jobs/mutations/createFactoryJob"

type InputType = {
  companyId: string
}
const createFactoryItems = async ({ companyId }: InputType, ctx: Ctx) => {
  await createFactoryCategories(companyId, ctx)
  await createFactoryEmailTemplates({ companyId }, ctx)
  await createFactoryCandidatePools({ companyId }, ctx)

  // await createWorkflowWithFactoryWorkflowStages(
  //   { workflowName: "Default", companyId, factoryWorkflow: true },
  //   ctx
  // )
  // await createFormWithFactoryFormQuestions(
  //   { formName: "Default", companyId, factoryForm: true },
  //   ctx
  // )
  // await createScoreCardWithFactoryScoreCardQuestions(
  //   { scoreCardName: "Default", companyId, factoryScoreCard: true },
  //   ctx
  // )
}

export default createFactoryItems
