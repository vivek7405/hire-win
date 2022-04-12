import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
// import { AddCalendar } from "app/categories/validations"

type AddCalendarFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const AddCalendarForm = (props: AddCalendarFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        // schema={AddCalendar}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addCalendarForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Calendar Name"
          placeholder="Enter a name you'd like for your calendar"
          testid="addCalendarName"
        />
      </Form>
    </>
  )
}

export default AddCalendarForm
