import { SingleFileUploadField } from "app/core/components/SingleFileUploadField"
import { Form } from "app/core/components/Form"
import { UserObj } from "app/users/validations"
import LabeledTextField from "app/core/components/LabeledTextField"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import ThemePickerField from "app/core/components/ThemePickerField"

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
          name="name"
          label="Name"
          placeholder="Enter your name"
          testid="userUpdateName"
        />
        <LabeledTextField
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          testid="userUpdateEmail"
        />
      </Form>
    </>
  )
}

export default UserForm
