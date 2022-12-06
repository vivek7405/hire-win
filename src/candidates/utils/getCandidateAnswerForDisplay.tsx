import { PaperClipIcon } from "@heroicons/react/outline"
import { FormQuestionType } from "@prisma/client"
import QuestionForm from "src/form-questions/components/QuestionForm"
import { AttachmentObject, ExtendedAnswer, ExtendedCandidate, ExtendedFormQuestion } from "types"

const getCandidateAnswerForDisplay = (
  formQuestion: ExtendedFormQuestion,
  candidate: ExtendedCandidate,
  isTableView: boolean
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
        return selectedOptions?.join(", ")
      case FormQuestionType.Single_select:
        return answer?.formQuestion?.options?.find((op) => val === op.id)?.text
      case FormQuestionType.Attachment:
        const attachmentObj: AttachmentObject = JSON.parse(val || "{}")
        return attachmentObj &&
          attachmentObj?.location &&
          attachmentObj?.location?.trim() !== "" ? (
          isTableView ? (
            <a
              href={attachmentObj.location}
              className="text-theme-600 hover:text-theme-500"
              target="_blank"
              rel="noreferrer"
            >
              {attachmentObj.name}
            </a>
          ) : (
            <div className="flex items-center justify-between py-3 pl-3 pr-4 text-sm rounded-md border border-gray-200">
              <div className="flex w-0 flex-1 items-center">
                <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <span className="ml-2 w-0 flex-1 truncate">{attachmentObj.name}</span>
              </div>
              <div className="ml-4 flex-shrink-0">
                <a
                  href={attachmentObj.location}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Download
                </a>
              </div>
            </div>
          )
        ) : null
      case FormQuestionType.Long_text:
        return val ? (
          isTableView ? (
            <p className="max-w-md overflow-auto">{val}</p>
          ) : (
            <textarea
              key={val}
              className="border rounded border-gray-200 w-full text-sm text-gray-900"
              readOnly={true}
            >
              {val}
            </textarea>
          )
        ) : null
      default:
        return val
    }
  }

  return ""
}

export default getCandidateAnswerForDisplay
