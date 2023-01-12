import createFactoryCategories from "src/categories/mutations/createFactoryCategories"
import createFactoryEmailTemplates from "src/email-templates/mutations/createFactoryEmailTemplates"
import createFactoryCandidatePools from "src/candidate-pools/mutations/createFactoryCandidatePools"
// import createFormWithFactoryFormQuestions from "src/forms/mutations/createFormWithFactoryFormQuestions"
// import createScoreCardWithFactoryScoreCardQuestions from "src/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
// import createWorkflowWithFactoryWorkflowStages from "src/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import { Ctx } from "blitz"
import createFactoryJob from "src/jobs/mutations/createFactoryJob"
import createFactoryParentEmailTemplates from "src/email-templates/mutations/createFactoryParentEmailTemplates"
import createFactoryParentCandidatePools from "src/candidate-pools/mutations/createFactoryParentCandidatePools"

type InputType = {
  companyId: string
  parentCompanyId: string
}
const createFactoryItems = async ({ companyId, parentCompanyId }: InputType, ctx: Ctx) => {
  await createFactoryCategories(companyId, ctx)
  await createFactoryEmailTemplates({ companyId }, ctx)
  await createFactoryCandidatePools({ companyId }, ctx)

  await createFactoryParentEmailTemplates({ parentCompanyId }, ctx)
  await createFactoryParentCandidatePools({ parentCompanyId }, ctx)

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
