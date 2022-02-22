import { FormQuestion, Question, QuestionType } from "@prisma/client"
import { ExtendedFormQuestion } from "types"

const mandatoryQuestions = [
  {
    key: "qname",
    id: "qname",
    createdAt: new Date(),
    updatedAt: new Date(),

    name: "Name",
    placeholder: "Enter your name",
    type: QuestionType.Single_line_text,
    options: null,
    required: true,
    hidden: false,

    acceptedFiles: "",

    slug: "Name",

    forms: null,

    user: null,
    userId: 0,

    answers: null,
  } as Question,
  {
    key: "qemail",
    id: "qemail",
    createdAt: new Date(),
    updatedAt: new Date(),

    name: "Email",
    placeholder: "Enter your email",
    type: QuestionType.Email,
    options: null,
    required: true,
    hidden: false,

    acceptedFiles: "",

    slug: "Name",

    forms: null,

    user: null,
    userId: 0,

    answers: null,
  } as Question,
  {
    key: "qresume",
    id: "qresume",
    createdAt: new Date(),
    updatedAt: new Date(),

    name: "Resume",
    placeholder: "Upload your resume",
    type: QuestionType.Attachment,
    options: null,
    required: true,
    hidden: false,

    acceptedFiles: "application/pdf",

    slug: "Name",

    forms: null,

    user: null,
    userId: 0,

    answers: null,
  } as Question,
]

const mandatoryFormQuestions = mandatoryQuestions.map((q) => {
  return {
    key: q.id,
    id: "fqid",
    createdAt: new Date(),
    updatedAt: new Date(),

    order: 0,

    form: null,
    formId: "",

    question: q,
    questionId: "",
  } as ExtendedFormQuestion
})

export default mandatoryFormQuestions
