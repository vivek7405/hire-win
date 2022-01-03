import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Question } from "app/questions/validations"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { QuestionType } from "@prisma/client"
import CheckboxField from "app/core/components/CheckboxField"

type QuestionFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
  editMode: boolean
}

export const QuestionForm = (props: QuestionFormProps) => {
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
        <LabeledSelectField
          name="type"
          label="Type"
          placeholder="Question Type"
          testid="questionType"
          disabled={props.editMode}
          options={Object.keys(QuestionType).map((questionType) => {
            return { text: questionType.replaceAll("_", " "), value: questionType }
          })}
        />
        <LabeledTextField
          name="info"
          label="Info"
          placeholder="Question Info"
          testid="questionInfo"
        />
        <LabeledTextField
          name="placeholder"
          label="Placeholder"
          placeholder="Question Placeholder"
          testid="questionPlaceholder"
        />
        <CheckboxField name="required" label="Required" testid="questionRequired" />
        <CheckboxField name="hidden" label="Hidden" testid="questionHidden" />
      </Form>
    </>
  )
}

export default QuestionForm
