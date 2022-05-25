import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"

type InvitationFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subheader: string
}

export const InvitationForm = (props: InvitationFormProps) => {
  return (
    <>
      <Form
        header={props.header}
        subHeader={props.subheader}
        submitText="Invite"
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
        <LabeledTextField
          name="email"
          type="email"
          label="Email"
          placeholder="partner@company.com"
          testid="inviteEmail"
        />
      </Form>
    </>
  )
}

export default InvitationForm
