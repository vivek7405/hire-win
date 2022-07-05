import createFactoryCandidatePools from "app/candidate-pools/mutations/createFactoryCandidatePools"
import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createFactoryEmailTemplates from "app/email-templates/mutations/createFactoryEmailTemplates"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"

const createFactoryItems = async (companyId: number) => {
  await createFactoryCategories(companyId)
  await createWorkflowWithFactoryWorkflowStages("Default", companyId, true)
  await createFormWithFactoryFormQuestions("Default", companyId, true)
  await createScoreCardWithFactoryScoreCardQuestions("Default", companyId, true)
  await createFactoryEmailTemplates(companyId)
  await createFactoryCandidatePools(companyId)
}

export default createFactoryItems
