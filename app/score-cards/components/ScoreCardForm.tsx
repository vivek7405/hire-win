import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { ScoreCardObj } from "app/score-cards/validations"

type ScoreCardFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const ScoreCardForm = (props: ScoreCardFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={ScoreCardObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="scoreCardForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Score Card Name"
          testid="scoreCardName"
        />
      </Form>
    </>
  )
}

export default ScoreCardForm
