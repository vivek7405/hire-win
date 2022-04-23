import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Question } from "app/questions/validations"
import { QuestionType } from ".prisma1/client"
import CheckboxField from "app/core/components/CheckboxField"
import { useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"

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
        schema={Question}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="questionForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Question Name"
          testid="questionName"
        />
        <LabeledReactSelectField
          name="type"
          label="Type"
          placeholder="Question Type"
          testid="questionType"
          disabled={props.editmode}
          defaultValue={Object.keys(QuestionType)[0]}
          options={Object.keys(QuestionType).map((questionType) => {
            return { label: questionType.replaceAll("_", " "), value: questionType }
          })}
          onChange={setSelectedQuestionType}
        />
        {
          selectedQuestionType === QuestionType.Attachment && (
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
        {(selectedQuestionType === QuestionType.Single_select ||
          selectedQuestionType === QuestionType.Multiple_select) && (
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
