import { SingleFileUploadField } from "app/core/components/SingleFileUploadField"
import { Form } from "app/core/components/Form"
import { UserObj } from "app/users/validations"
import LabeledTextField from "app/core/components/LabeledTextField"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import ThemePickerField from "app/core/components/ThemePickerField"
import { CompanyObj } from "../validations"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import { getTailwindColors } from "app/core/utils/themeHelpers"

type CompanyFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
}

export const CompanyForm = (props: CompanyFormProps) => {
  const tailwindColors = getTailwindColors(true)

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

        <LabeledRichTextField
          name="info"
          label="Info"
          placeholder="This shall appear on job boards"
          testid="userUpdateCompanyInfo"
        />

        {/* <ThemePickerField name="theme" label="Careers Page Theme" /> */}
        <LabeledReactSelectField
          name="theme"
          label="Careers Page Theme"
          options={Object.keys(tailwindColors)?.map((key) => {
            return {
              label: (
                key.replace("-600", "").charAt(0).toUpperCase() + key.replace("-600", "").slice(1)
              )
                .replace(/([A-Z])/g, " $1")
                .trim(),
              value: key.replace("-600", ""),
              color: tailwindColors[key],
            }
          })}
          isColored={true}
        />
      </Form>
    </>
  )
}

export default CompanyForm
