import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { WorkflowObj } from "app/workflows/validations"

type WorkflowFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const WorkflowForm = (props: WorkflowFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={WorkflowObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="workflowForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Workflow Name"
          testid="workflowName"
        />
      </Form>
    </>
  )
}

export default WorkflowForm
