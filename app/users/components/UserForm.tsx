import { SingleFileUploadField } from "app/core/components/SingleFileUploadField"
import { Form } from "app/core/components/Form"
import { User } from "app/users/validations"

type UserFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
}

export const UserForm = (props: UserFormProps) => {
  return (
    <>
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Submit"
        schema={User}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
      >
        <SingleFileUploadField name="avatar" label="Avatar" onSubmit={props.onSubmit} />
      </Form>
    </>
  )
}

export default UserForm
