import Form from "src/core/components/Form"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import LabeledTextField from "src/core/components/LabeledTextField"
import { EmailTemplateObj } from "../validations"

type EmailTemplateFormProps = {
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}
export const EmailTemplateForm = ({
  header,
  subHeader,
  initialValues,
  onSubmit,
}: EmailTemplateFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={EmailTemplateObj}
        header={header}
        subHeader={subHeader}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        <LabeledTextField name="name" label="Name" placeholder="Template name" />
        <LabeledTextField name="subject" label="Subject" placeholder="Email subject" />
        <LabeledRichTextField name="body" label="Body" showTemplatePlaceholders={true} />
      </Form>
    </>
  )
}

export default EmailTemplateForm
