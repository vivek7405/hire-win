import { useQuery } from "@blitzjs/rpc";
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { LabeledTextAreaField } from "src/core/components/LabeledTextAreaField"
import { Form } from "src/core/components/Form"
import { Job, FormQuestionType, Behaviour } from "@prisma/client"
import CheckboxField from "src/core/components/CheckboxField"
import { useEffect, useState } from "react"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import DynamicTextFields from "src/core/components/DynamicTextFields"
import SingleFileUploadField from "src/core/components/SingleFileUploadField"
import LabeledSelectField from "src/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "src/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "src/core/components/LabeledRatingField"
import { z } from "zod"
import getFormQuestionsWOPaginationWOAbility from "src/form-questions/queries/getJobApplicationFormQuestions"
import { ExtendedFormQuestion } from "types"
import { AttachmentZodObj } from "../validations"
import getJobApplicationFormQuestions from "src/form-questions/queries/getJobApplicationFormQuestions"

type ApplicationFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  submitDisabled?: boolean
  header: string
  subHeader: string
  jobId: string
  preview: boolean
  careersPage?: boolean
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
          [question.title]:
            question.behaviour === "REQUIRED"
              ? AttachmentZodObj.refine(
                  (obj) =>
                    obj !== null && obj?.name !== "" && obj?.key !== "" && obj?.location !== "",
                  {
                    message: "Required",
                  }
                )
              : AttachmentZodObj,
        }
      case FormQuestionType.Checkbox:
        return { [question.title]: getZodType(question, z.boolean()) }
      case FormQuestionType.Multiple_select:
        return { [question.title]: getZodType(question, z.array(z.string())) }
      case FormQuestionType.Rating:
        return { [question.title]: getZodType(question, z.number()) }
      default:
        return { [question.title]: getZodType(question, z.string()) }
    }
  }

  const getQuestionField = (question: ExtendedFormQuestion) => {
    switch (question.type) {
      case FormQuestionType.Single_line_text:
        return (
          <LabeledTextField
            key={question.id}
            type="text"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Long_text:
        return (
          <LabeledTextAreaField
            key={question.id}
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Attachment:
        return (
          <SingleFileUploadField
            key={question.id}
            accept={question.acceptedFiles}
            name={question.title}
            label={question.title}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Checkbox:
        return (
          <CheckboxField
            key={question.id}
            name={question.title}
            label={question.title}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Multiple_select:
        return (
          <LabeledReactSelectField
            key={question.id}
            isMulti={true}
            options={question.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Single_select:
        return (
          <LabeledReactSelectField
            key={question.id}
            options={question.options?.map((op) => {
              return { label: op.text, value: op.id }
            })}
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Date:
        return (
          <LabeledTextField
            key={question.id}
            type="date"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Phone_number:
        return (
          <LabeledPhoneNumberField
            key={question.id}
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Email:
        return (
          <LabeledTextField
            key={question.id}
            type="email"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.URL:
        return (
          <LabeledTextField
            key={question.id}
            type="url"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Number:
        return (
          <LabeledTextField
            key={question.id}
            type="number"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      case FormQuestionType.Rating:
        return (
          <LabeledRatingField
            key={question.id}
            name={question.title}
            label={question.title}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )

      default:
        return (
          <LabeledTextField
            key={question.id}
            type="text"
            name={question.title}
            label={question.title}
            placeholder={question.placeholder}
            showAsterisk={question.behaviour === Behaviour.REQUIRED}
          />
        )
    }
  }

  // If candidate is being added internally (not being added from careers page),
  // let the user add them by just entering the name and email,
  // other fields can be optionally added irrespective of the form configuration
  if (!props.careersPage && !props.preview) {
    formQuestions.map((question) => {
      if (question.title !== "Name" && question.title !== "Email") {
        if (question.behaviour === Behaviour.REQUIRED) {
          question.behaviour = Behaviour.OPTIONAL
        }
      }
    })
  }

  let validationObj = {}
  formQuestions.forEach((fq) => {
    validationObj = { ...validationObj, ...getValidationObj(fq as any) }
  })
  let zodObj = z.object(validationObj)

  return (
    <>
      <div className="bg-white w-full rounded-lg">
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
          className="max-w-md mx-auto"
          isRounded={props.careersPage}
        >
          {formQuestions.map((question) => {
            // Hide question only on careers page and not when adding candidate manually
            if ((props.careersPage || props.preview) && question.behaviour === "OFF") {
              return
            }
            return getQuestionField(question as any)
          })}
        </Form>
      </div>
    </>
  )
}

export default ApplicationForm
