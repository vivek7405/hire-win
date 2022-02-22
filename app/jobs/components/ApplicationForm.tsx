import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { Question, QuestionOption } from "app/questions/validations"
import { Job, QuestionType } from "@prisma/client"
import CheckboxField from "app/core/components/CheckboxField"
import { useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import { useQuery } from "blitz"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "app/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import { z } from "zod"
import getFormQuestionsWOPagination from "app/forms/queries/getFormQuestionsWOPagination"
import mandatoryFormQuestions from "../utils/mandatoryFormQuestions"

type ApplicationFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  formId: string
  preview: boolean
}

export const ApplicationForm = (props: ApplicationFormProps) => {
  const [formQuestions] = useQuery(getFormQuestionsWOPagination, {
    where: { formId: props.formId },
  })

  const getZodType = (question, zodType) => {
    return question.required
      ? zodType.nonempty
        ? zodType.nonempty({ message: "Required" })
        : zodType
      : zodType.optional()
  }

  const getValidationObj = (q, validationObj) => {
    switch (q.type) {
      // case (QuestionType.Single_line_text || QuestionType.Long_text ||
      //   QuestionType.Single_select || QuestionType.Phone_number || QuestionType.Date ||
      //   QuestionType.Number || QuestionType.Email || QuestionType.URL
      // ):
      //   validationObj = { ...validationObj, [q.name]: getZodType(q, z.string()) }
      //   break
      case QuestionType.Attachment:
        return { [q.name]: getZodType(q, z.any()) }
      case QuestionType.Checkbox:
        return { [q.name]: getZodType(q, z.boolean()) }
      case QuestionType.Multiple_select:
        return { [q.name]: getZodType(q, z.array(z.string())) }
      case QuestionType.Rating:
        return { [q.name]: getZodType(q, z.number()) }
      default:
        return { [q.name]: getZodType(q, z.string()) }
    }
  }

  const getQuestionField = (q) => {
    switch (q.type) {
      case QuestionType.Single_line_text:
        return (
          <LabeledTextField
            key={q.id}
            type="text"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Long_text:
        return (
          <LabeledTextAreaField
            key={q.id}
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Attachment:
        return (
          <SingleFileUploadField key={q.id} accept={q.acceptedFiles} name={q.name} label={q.name} />
        )

      case QuestionType.Checkbox:
        return <CheckboxField key={q.id} name={q.name} label={q.name} />

      case QuestionType.Multiple_select:
        return (
          <LabeledReactSelectField
            key={q.id}
            isMulti={true}
            options={q.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Single_select:
        return (
          <LabeledReactSelectField
            key={q.id}
            options={q.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Date:
        return (
          <LabeledTextField
            key={q.id}
            type="date"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Phone_number:
        return (
          <LabeledPhoneNumberField
            key={q.id}
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Email:
        return (
          <LabeledTextField
            key={q.id}
            type="email"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.URL:
        return (
          <LabeledTextField
            key={q.id}
            type="url"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Number:
        return (
          <LabeledTextField
            key={q.id}
            type="number"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )

      case QuestionType.Rating:
        return <LabeledRatingField key={q.id} name={q.name} label={q.name} />

      default:
        return (
          <LabeledTextField
            key={q.id}
            type="text"
            name={q.name}
            label={q.name}
            placeholder={q.placeholder}
          />
        )
    }
  }

  let validationObj = {}
  mandatoryFormQuestions.forEach((fq) => {
    validationObj = { ...validationObj, ...getValidationObj(fq.question, validationObj) }
  })
  formQuestions.forEach((fq) => {
    validationObj = { ...validationObj, ...getValidationObj(fq.question, validationObj) }
  })
  let zodObj = z.object(validationObj)

  return (
    <>
      <Form
        submitText="Submit"
        // submitDisabled={props.preview}
        schema={zodObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="applicationForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        {mandatoryFormQuestions.map((fq) => {
          if (fq.question.hidden) {
            return
          }
          return getQuestionField(fq.question)
        })}
        {formQuestions.map((fq) => {
          const q = fq.question
          if (q.hidden) {
            return
          }
          return getQuestionField(q)
        })}
      </Form>
    </>
  )
}

export default ApplicationForm
