import { SingleFileUploadField } from "src/core/components/SingleFileUploadField"
import { Form } from "src/core/components/Form"
import { UserObj } from "src/users/validations"
import LabeledTextField from "src/core/components/LabeledTextField"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import ThemePickerField from "src/core/components/ThemePickerField"

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
      <div className="bg-white w-full">
        <Form
          header={props.header}
          subHeader={props.subHeader}
          submitText="Submit"
          schema={UserObj}
          initialValues={props.initialValues}
          onSubmit={props.onSubmit}
          className="max-w-sm mx-auto"
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
      </div>
    </>
  )
}

export default UserForm
