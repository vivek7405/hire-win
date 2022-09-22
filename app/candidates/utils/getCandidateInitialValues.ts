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
          initialValues[answer?.formQuestion?.name] = selectedOptionIds
          break
        case FormQuestionType.Attachment:
          const attachmentObj: AttachmentObject = JSON.parse(val)
          initialValues[answer?.formQuestion?.name] = attachmentObj
          break
        case FormQuestionType.Checkbox:
          const isChecked: boolean = val === "true"
          initialValues[answer?.formQuestion?.name] = isChecked
          break
        case FormQuestionType.Rating:
          initialValues[answer?.formQuestion?.name] = val ? parseInt(val) : 0
          break
        default:
          initialValues[answer?.formQuestion?.name] = val
          break
      }
    }
  })

  return initialValues
}

export default getCandidateInitialValues
