import { Answer, Candidate, Question, QuestionType } from "@prisma/client"
import { AttachmentObject } from "types"

function getCandidateInitialValues(
  candidate: Candidate & { answers: (Answer & { question: Question })[] }
) {
  const initialValues: any = {}

  candidate?.answers?.forEach((answer) => {
    if (answer) {
      const val = answer.value
      const type = answer?.question?.type

      switch (type) {
        case QuestionType.Multiple_select:
          const selectedOptionIds: String[] = JSON.parse(val || "[]")
          initialValues[answer?.question?.name] = selectedOptionIds
          break
        case QuestionType.Attachment:
          const attachmentObj: AttachmentObject = JSON.parse(val)
          initialValues[answer?.question?.name] = attachmentObj
          break
        case QuestionType.Checkbox:
          const isChecked: boolean = val === "true"
          initialValues[answer?.question?.name] = isChecked
          break
        case QuestionType.Rating:
          initialValues[answer?.question?.name] = val ? parseInt(val) : 0
          break
        default:
          initialValues[answer?.question?.name] = val
          break
      }
    }
  })

  return initialValues
}

export default getCandidateInitialValues
