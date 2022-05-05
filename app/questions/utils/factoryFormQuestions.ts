import { FormQuestionBehaviour, Question, QuestionType } from "@prisma/client"
import { ExtendedFormQuestion } from "types"

const factoryFormQuestions = [
  {
    order: 1,
    behaviour: FormQuestionBehaviour.REQUIRED,
    allowBehaviourEdit: false,
    question: {
      name: "Name",
      type: QuestionType.Single_line_text,
      placeholder: "Enter your name",
      factory: true,
    } as Question,
  } as ExtendedFormQuestion,
  {
    order: 2,
    behaviour: FormQuestionBehaviour.REQUIRED,
    allowBehaviourEdit: false,
    question: {
      name: "Email",
      type: QuestionType.Email,
      placeholder: "Enter your email",
      factory: true,
    } as Question,
  } as ExtendedFormQuestion,
  {
    order: 3,
    behaviour: FormQuestionBehaviour.REQUIRED,
    allowBehaviourEdit: true,
    question: {
      name: "Resume",
      type: QuestionType.Attachment,
      acceptedFiles: "application/pdf",
      placeholder: "Upload your resume",
      factory: true,
    } as Question,
  } as ExtendedFormQuestion,
]

export default factoryFormQuestions
