import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { UserSecurity } from "app/users/validations"

type SecurityFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
}

export const SecurityForm = (props: SecurityFormProps) => {
  return (
    <>
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Submit"
        schema={UserSecurity}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
      >
        <LabeledTextField name="currentPassword" label="Current Password" type="password" />
        <LabeledTextField name="newPassword" label="New Password" type="password" />
        <LabeledTextField name="confirmNewPassword" label="Confirm New Password" type="password" />
      </Form>
    </>
  )
}

export default SecurityForm
