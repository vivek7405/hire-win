import { SingleFileUploadField } from "app/core/components/SingleFileUploadField"
import { Form } from "app/core/components/Form"
import { UserObj } from "app/users/validations"
import LabeledTextField from "app/core/components/LabeledTextField"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import ThemePickerField from "app/core/components/ThemePickerField"
import { CompanyObj } from "../validations"

type CompanyFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
}

export const CompanyForm = (props: CompanyFormProps) => {
  return (
    <>
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Submit"
        schema={CompanyObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
      >
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Enter company name"
          testid="userUpdateName"
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
          name="info"
          label="Info"
          placeholder="This shall appear on job boards"
          testid="userUpdateCompanyInfo"
        />
      </Form>
    </>
  )
}

export default CompanyForm
