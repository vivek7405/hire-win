import Form from "app/core/components/Form"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledTextField from "app/core/components/LabeledTextField"
import { EmailObj } from "../validations"

type EmailFormProps = {
  initialValues?: {}
  disabled?: boolean
  onSubmit: any
  header: string
  subHeader: string
}
export const EmailForm = ({
  header,
  subHeader,
  initialValues,
  onSubmit,
  disabled,
}: EmailFormProps) => {
  return (
    <>
      <Form
        submitDisabled={disabled}
        submitText="Submit"
        schema={EmailObj}
        header={header}
        subHeader={subHeader}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        <LabeledTextField
          name="subject"
          disabled={disabled}
          label="Subject"
          placeholder="Email subject"
        />
        {disabled ? (
          (initialValues as any)?.cc && (
            <LabeledTextField
              name="cc"
              disabled={disabled}
              title={(initialValues as any)?.cc}
              label="CC"
              placeholder="Add emails to be kept in CC"
            />
          )
        ) : (
          <LabeledTextField
            name="cc"
            disabled={disabled}
            title={(initialValues as any)?.cc}
            label="CC"
            placeholder="Add emails to be kept in CC"
          />
        )}
        <LabeledRichTextField
          name="body"
          readOnly={disabled}
          toolbarHidden={disabled}
          label="Body"
        />
      </Form>
    </>
  )
}

export default EmailForm
