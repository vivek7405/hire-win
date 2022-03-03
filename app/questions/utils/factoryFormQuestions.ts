import { FormQuestionBehaviour, Question, QuestionType } from "@prisma/client"
import { ExtendedFormQuestion } from "types"

const factoryFormQuestions = [
  {
    order: 1,
    behaviour: FormQuestionBehaviour.REQUIRED,
    question: {
      name: "Name",
      type: QuestionType.Single_line_text,
      placeholder: "Enter your name",
    } as Question,
  } as ExtendedFormQuestion,
  {
    order: 2,
    behaviour: FormQuestionBehaviour.REQUIRED,
    question: {
      name: "Email",
      type: QuestionType.Email,
      placeholder: "Enter your email",
    } as Question,
  } as ExtendedFormQuestion,
  {
    order: 3,
    behaviour: FormQuestionBehaviour.REQUIRED,
    question: {
      name: "Resume",
      type: QuestionType.Attachment,
      acceptedFiles: "application/pdf",
      placeholder: "Upload your resume",
    } as Question,
  } as ExtendedFormQuestion,
]

export default factoryFormQuestions