import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { Question, QuestionOption } from "app/questions/validations"
import { QuestionType } from "@prisma/client"
import CheckboxField from "app/core/components/CheckboxField"
import { useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import { useQuery } from "blitz"
import getFormQuestionsWOPagination from "../queries/getFormQuestionsWOPagination"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "app/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import { z } from "zod"

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

  let validationObj = {}
  debugger
  formQuestions.forEach((fq) => {
    const q = fq.question
    switch (q.type) {
      // case (QuestionType.Single_line_text || QuestionType.Long_text ||
      //   QuestionType.Single_select || QuestionType.Phone_number || QuestionType.Date ||
      //   QuestionType.Number || QuestionType.Email || QuestionType.URL
      // ):
      //   validationObj = { ...validationObj, [q.name]: getZodType(q, z.string()) }
      //   break
      case QuestionType.Attachment:
        validationObj = { ...validationObj, [q.name]: getZodType(q, z.any()) }
        break
      case QuestionType.Checkbox:
        validationObj = { ...validationObj, [q.name]: getZodType(q, z.boolean()) }
        break
      case QuestionType.Multiple_select:
        validationObj = { ...validationObj, [q.name]: getZodType(q, z.array(z.string())) }
        break
      case QuestionType.Rating:
        validationObj = { ...validationObj, [q.name]: getZodType(q, z.number()) }
        break
      default:
        validationObj = { ...validationObj, [q.name]: getZodType(q, z.string()) }
        break
    }
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
        {formQuestions.map((fq) => {
          const q = fq.question
          switch (q.type) {
            case QuestionType.Single_line_text:
              return (
                <LabeledTextField
                  key={`${q.id}-${q.name}`}
                  type="text"
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Long_text:
              return (
                <LabeledTextAreaField
                  key={`${q.id}-${q.name}`}
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Attachment:
              return (
                <SingleFileUploadField
                  key={`${q.id}-${q.name}`}
                  accept={q.acceptedFiles}
                  name={q.name}
                  label={q.name}
                  onSubmit={() => {}}
                />
              )

            case QuestionType.Checkbox:
              return <CheckboxField key={`${q.id}-${q.name}`} name={q.name} label={q.name} />

            case QuestionType.Multiple_select:
              return (
                <LabeledReactSelectField
                  key={`${q.id}-${q.name}`}
                  isMulti={true}
                  options={q.options.map((op) => {
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
                  key={`${q.id}-${q.name}`}
                  options={q.options.map((op) => {
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
                  key={`${q.id}-${q.name}`}
                  type="date"
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Phone_number:
              return (
                <LabeledPhoneNumberField
                  key={`${q.id}-${q.name}`}
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Email:
              return (
                <LabeledTextField
                  key={`${q.id}-${q.name}`}
                  type="email"
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.URL:
              return (
                <LabeledTextField
                  key={`${q.id}-${q.name}`}
                  type="url"
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Number:
              return (
                <LabeledTextField
                  key={`${q.id}-${q.name}`}
                  type="number"
                  name={q.name}
                  label={q.name}
                  placeholder={q.placeholder}
                />
              )

            case QuestionType.Rating:
              return <LabeledRatingField key={`${q.id}-${q.name}`} name={q.name} label={q.name} />
          }
        })}
      </Form>
    </>
  )
}

export default ApplicationForm
