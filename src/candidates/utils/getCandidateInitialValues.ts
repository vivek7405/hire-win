import { Answer, Candidate, FormQuestion, FormQuestionType } from "@prisma/client"
import { AttachmentObject } from "types"

function getCandidateInitialValues(
  candidate: Candidate & { answers: (Answer & { formQuestion: FormQuestion })[] }
) {
  const initialValues: any = {}

  candidate?.answers?.forEach((answer) => {
    if (answer) {
      const val = answer.value
      const type = answer?.formQuestion?.type

      switch (type) {
        case FormQuestionType.Multiple_select:
          const selectedOptionIds: String[] = JSON.parse(val || "[]")
          initialValues[answer?.formQuestion?.title] = selectedOptionIds
          break
        case FormQuestionType.Attachment:
          const attachmentObj: AttachmentObject = JSON.parse(val)
          initialValues[answer?.formQuestion?.title] = attachmentObj
          break
        case FormQuestionType.Checkbox:
          const isChecked: boolean = val === "true"
          initialValues[answer?.formQuestion?.title] = isChecked
          break
        case FormQuestionType.Rating:
          initialValues[answer?.formQuestion?.title] = val ? parseInt(val) : 0
          break
        default:
          initialValues[answer?.formQuestion?.title] = val
          break
      }
    }
  })

  return initialValues
}

export default getCandidateInitialValues
