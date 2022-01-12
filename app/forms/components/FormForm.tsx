import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { FormObj } from "app/forms/validations"

type FormFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const FormForm = (props: FormFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={FormObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="formForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Form Name"
          testid="formName"
        />
      </Form>
    </>
  )
}

export default FormForm
