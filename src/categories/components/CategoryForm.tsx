import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import { CategoryObj } from "src/categories/validations"

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
        schema={CategoryObj}
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
