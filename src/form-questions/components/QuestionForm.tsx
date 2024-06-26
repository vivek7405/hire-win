import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import { FormQuestionObj } from "src/form-questions/validations"
import { FormQuestionType } from "@prisma/client"
import CheckboxField from "src/core/components/CheckboxField"
import { useState } from "react"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import DynamicTextFields from "src/core/components/DynamicTextFields"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"

type QuestionFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  editmode: boolean
}

export const QuestionForm = (props: QuestionFormProps) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState(
    props.initialValues?.type || null
  )

  // const restrictFileOptions = [
  //   { label: "pdf", value: "application/pdf" },
  //   { label: "image", value: "image/*" },
  //   { label: "document", value: "application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .pages" },
  //   { label: "sheet", value: "application/vnd.ms-excel, .numbers" },
  //   { label: "presentation", value: "application/vnd.ms-powerpoint, .key" },
  //   { label: "text", value: "text/plain, .rtf" },
  // ]

  return (
    <>
      <Form
        submitText="Submit"
        schema={FormQuestionObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="questionForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          name="title"
          label="Title"
          placeholder="Question Title"
          testid="questionName"
        />
        <LabeledReactSelectField
          name="type"
          label="Type"
          placeholder="Question Type"
          testid="questionType"
          disabled={props.editmode}
          defaultValue={Object.keys(FormQuestionType)[0]}
          options={Object.keys(FormQuestionType).map((questionType) => {
            return { label: questionType.replaceAll("_", " "), value: questionType }
          })}
          onChange={setSelectedQuestionType}
        />
        {
          selectedQuestionType === FormQuestionType.Attachment && (
            <LabeledTextField
              name="acceptedFiles"
              label="Accepted Files"
              placeholder="Add accepted files using comma seperation, eg. application/pdf, .png, .jpg, audio/*"
              testid="acceptedFiles"
            />
          )
          // <LabeledReactSelectField
          //   name="restrictFiles"
          //   label="Restrict Files"
          //   testid="restrictFiles"
          //   options={restrictFileOptions}
          //   isMulti={true}
          // />
        }
        {(selectedQuestionType === FormQuestionType.Single_select ||
          selectedQuestionType === FormQuestionType.Multiple_select) && (
          <DynamicTextFields
            name="options"
            type="text"
            label="Question Options"
            placeholder="Question option"
          />
        )}
        <LabeledTextField
          name="placeholder"
          label="Placeholder"
          placeholder="Question Placeholder"
          testid="questionPlaceholder"
        />
      </Form>
    </>
  )
}

export default QuestionForm
