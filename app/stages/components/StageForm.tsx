import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { StageObj } from "app/stages/validations"

type StageFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const StageForm = (props: StageFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={StageObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="stageForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Stage Name"
          testid="stageName"
        />
      </Form>
    </>
  )
}

export default StageForm
