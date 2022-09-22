import { FormQuestionType } from "@prisma/client"
import { AttachmentObject, ExtendedAnswer, ExtendedCandidate, ExtendedFormQuestion } from "types"

const getCandidateAnswerForDisplay = (
  formQuestion: ExtendedFormQuestion,
  candidate: ExtendedCandidate
) => {
  const answer: ExtendedAnswer = candidate?.answers?.find(
    (ans) => ans.formQuestion?.title === formQuestion?.title
  )!

  if (answer) {
    const val = answer.value
    const type = answer?.formQuestion?.type

    switch (type) {
      case FormQuestionType.URL:
        return val ? (
          <a
            href={val}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {val}
          </a>
        ) : null
      case FormQuestionType.Multiple_select:
        const answerSelectedOptionIds: String[] = JSON.parse(val || "[]")
        const selectedOptions = answer?.formQuestion?.options
          ?.filter((op) => answerSelectedOptionIds?.includes(op.id))
          ?.map((op) => {
            return op.text
          })
        return JSON.stringify(selectedOptions)
      case FormQuestionType.Single_select:
        return answer?.formQuestion?.options?.find((op) => val === op.id)?.text
      case FormQuestionType.Attachment:
        const attachmentObj: AttachmentObject = JSON.parse(val || "{}")
        return attachmentObj && attachmentObj?.location?.trim() !== "" ? (
          <a
            href={attachmentObj.location}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {attachmentObj.name}
          </a>
        ) : null
      case FormQuestionType.Long_text:
        return val ? <p className="max-w-md overflow-auto">{val}</p> : null
      default:
        return val
    }
  }

  return ""
}

export default getCandidateAnswerForDisplay
