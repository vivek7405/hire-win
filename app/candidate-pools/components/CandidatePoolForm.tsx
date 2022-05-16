import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { CandidatePoolObj } from "app/candidate-pools/validations"

type CandidatePoolFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const CandidatePoolForm = (props: CandidatePoolFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={CandidatePoolObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="candidatePoolForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Candidate Pool Name"
          testid="candidatePoolName"
        />
      </Form>
    </>
  )
}

export default CandidatePoolForm
