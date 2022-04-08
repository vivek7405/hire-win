import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { CardQuestion } from "app/card-questions/validations"

type CardQuestionFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  editmode: boolean
}

export const CardQuestionForm = (props: CardQuestionFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={CardQuestion}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="cardQuestionForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Question Name"
          testid="cardQuestionName"
        />
      </Form>
    </>
  )
}

export default CardQuestionForm
