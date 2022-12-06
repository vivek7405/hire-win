import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import { ScoreCardQuestionObj } from "../validations"

type CardQuestionFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  editmode: boolean
}

export const ScoreCardQuestionForm = (props: CardQuestionFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={ScoreCardQuestionObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="cardQuestionForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          name="title"
          label="Title"
          placeholder="Question Title"
          testid="cardQuestionName"
        />
      </Form>
    </>
  )
}

export default ScoreCardQuestionForm
