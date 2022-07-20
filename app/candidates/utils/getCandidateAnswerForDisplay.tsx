import { QuestionType } from "@prisma/client"
import { AttachmentObject, ExtendedAnswer, ExtendedCandidate, ExtendedFormQuestion } from "types"

const getCandidateAnswerForDisplay = (
  formQuestion: ExtendedFormQuestion,
  candidate: ExtendedCandidate
) => {
  const answer: ExtendedAnswer = candidate?.answers?.find(
    (ans) => ans.question?.name === formQuestion?.question?.name
  )!

  if (answer) {
    const val = answer.value
    const type = answer?.question?.type

    switch (type) {
      case QuestionType.URL:
        return (
          <a
            href={val}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {val}
          </a>
        )
      case QuestionType.Multiple_select:
        const answerSelectedOptionIds: String[] = JSON.parse(val || "[]")
        const selectedOptions = answer?.question?.options
          ?.filter((op) => answerSelectedOptionIds?.includes(op.id))
          ?.map((op) => {
            return op.text
          })
        return JSON.stringify(selectedOptions)
      case QuestionType.Single_select:
        return answer?.question?.options?.find((op) => val === op.id)?.text
      case QuestionType.Attachment:
        const attachmentObj: AttachmentObject = JSON.parse(val || "{}")
        return attachmentObj && attachmentObj?.Key?.trim() !== "" ? (
          <a
            href={attachmentObj.Location}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {attachmentObj.Key}
          </a>
        ) : null
      case QuestionType.Long_text:
        return <p className="max-w-md overflow-auto">{val}</p>
      default:
        return val
    }
  }

  return ""
}

export default getCandidateAnswerForDisplay
