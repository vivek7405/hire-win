import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"

import { Job } from "app/jobs/validations"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const JobForm = (props: JobFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={Job}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="jobForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Job Name"
          testid="jobName"
        />
      </Form>
    </>
  )
}

export default JobForm
