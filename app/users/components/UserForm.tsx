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
        {/* <LabeledTextField
          type="text"
          name="companyName"
          label="Company Name"
          placeholder="This shall appear on job boards"
          testid="userUpdateCompanyName"
        />
        <LabeledTextField
          type="text"
          name="website"
          label="Website"
          placeholder="This shall be used to navigate to your website from job boards"
          testid="userUpdateWebsite"
        />

        <SingleFileUploadField showImage={true} accept="image/*" name="logo" label="Logo" />
        <ThemePickerField name="theme" label="Job Board Theme" />

        <LabeledRichTextField
          name="companyInfo"
          label="Company Info"
          placeholder="This shall appear on Job Boards"
          testid="userUpdateCompanyInfo"
        /> */}
      </Form>
    </>
  )
}

export default UserForm
