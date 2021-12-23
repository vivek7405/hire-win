import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Category } from "app/categories/validations"

type CategoryFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

export const CategoryForm = (props: CategoryFormProps) => {
  return (
    <>
      <Form
        submitText="Submit"
        schema={Category}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="categoryForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Category Name"
          testid="categoryName"
        />
      </Form>
    </>
  )
}

export default CategoryForm
