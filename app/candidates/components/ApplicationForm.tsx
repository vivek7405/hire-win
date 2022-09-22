import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { Job, FormQuestionType } from "@prisma/client"
import CheckboxField from "app/core/components/CheckboxField"
import { useEffect, useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import { useQuery } from "blitz"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "app/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import { z } from "zod"
import getFormQuestionsWOPaginationWOAbility from "app/form-questions/queries/getJobApplicationFormQuestions"
import { ExtendedFormQuestion } from "types"
import { AttachmentZodObj } from "../validations"
import getJobApplicationFormQuestions from "app/form-questions/queries/getJobApplicationFormQuestions"

type ApplicationFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  submitDisabled?: boolean
  header: string
  subHeader: string
  jobId: string
  preview: boolean
  // formQuestions?: ExtendedFormQuestion[]
}

export const ApplicationForm = (props: ApplicationFormProps) => {
  const [formQuestions] = useQuery(getJobApplicationFormQuestions, {
    where: { jobId: props.jobId },
  })

  // const formQuestions = props.formQuestions || queryFormQuestions

  const getZodType = (fq: ExtendedFormQuestion, zodType) => {
    const type = zodType?._def?.typeName as string
    switch (type) {
      case "ZodBoolean":
        return fq.behaviour === "REQUIRED"
          ? zodType.refine((val) => val === true, { message: "Required" })
          : zodType.optional()
      default:
        return fq.behaviour === "REQUIRED"
          ? zodType.nonempty
            ? zodType.nonempty({ message: "Required" })
            : zodType
          : zodType.optional()
    }
  }

  const getValidationObj = (question: ExtendedFormQuestion) => {
    switch (question.type) {
      case FormQuestionType.Attachment:
        return {
          [question.name]:
            question.behaviour === "REQUIRED"
              ? AttachmentZodObj.refine(
                  (obj) => obj !== null && obj.key !== "" && obj.location !== "",
                  {
                    message: "Required",
                  }
                )
              : AttachmentZodObj,
        }
      case FormQuestionType.Checkbox:
        return { [question.name]: getZodType(question, z.boolean()) }
      case FormQuestionType.Multiple_select:
        return { [question.name]: getZodType(question, z.array(z.string())) }
      case FormQuestionType.Rating:
        return { [question.name]: getZodType(question, z.number()) }
      default:
        return { [question.name]: getZodType(question, z.string()) }
    }
  }

  const getQuestionField = (question: ExtendedFormQuestion) => {
    switch (question.type) {
      case FormQuestionType.Single_line_text:
        return (
          <LabeledTextField
            key={question.id}
            type="text"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Long_text:
        return (
          <LabeledTextAreaField
            key={question.id}
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Attachment:
        return (
          <SingleFileUploadField
            key={question.id}
            accept={question.acceptedFiles}
            name={question.name}
            label={question.name}
          />
        )

      case FormQuestionType.Checkbox:
        return <CheckboxField key={question.id} name={question.name} label={question.name} />

      case FormQuestionType.Multiple_select:
        return (
          <LabeledReactSelectField
            key={question.id}
            isMulti={true}
            options={question.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Single_select:
        return (
          <LabeledReactSelectField
            key={question.id}
            options={question.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Date:
        return (
          <LabeledTextField
            key={question.id}
            type="date"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Phone_number:
        return (
          <LabeledPhoneNumberField
            key={question.id}
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Email:
        return (
          <LabeledTextField
            key={question.id}
            type="email"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.URL:
        return (
          <LabeledTextField
            key={question.id}
            type="url"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Number:
        return (
          <LabeledTextField
            key={question.id}
            type="number"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )

      case FormQuestionType.Rating:
        return <LabeledRatingField key={question.id} name={question.name} label={question.name} />

      default:
        return (
          <LabeledTextField
            key={question.id}
            type="text"
            name={question.name}
            label={question.name}
            placeholder={question.placeholder}
          />
        )
    }
  }

  let validationObj = {}
  formQuestions.forEach((fq) => {
    validationObj = { ...validationObj, ...getValidationObj(fq as any) }
  })
  let zodObj = z.object(validationObj)

  return (
    <>
      <Form
        submitText="Submit"
        submitDisabled={props.submitDisabled}
        submitHidden={props.preview}
        schema={zodObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="applicationForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        {formQuestions.map((question) => {
          if (question.behaviour === "OFF") {
            return
          }
          return getQuestionField(question as any)
        })}
      </Form>
    </>
  )
}

export default ApplicationForm
