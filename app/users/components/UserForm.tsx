import { SingleFileUploadField } from "app/core/components/SingleFileUploadField"
import { Form } from "app/core/components/Form"
import { UserObj } from "app/users/validations"
import LabeledTextField from "app/core/components/LabeledTextField"

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
        schema={UserObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
      >
        <LabeledTextField
          type="text"
          name="company"
          label="Company Name"
          placeholder="This shall appear on job board"
          testid="userUpdateCompany"
        />
        <SingleFileUploadField showImage={true} accept="image/*" name="avatar" label="Avatar" />
      </Form>
    </>
  )
}

export default UserForm
