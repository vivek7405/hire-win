import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
  user: any
}

export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: props.user?.id } })
  return (
    <>
      <Form
        submitText="Submit"
        schema={Job}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="jobForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Name"
          placeholder="Job Name"
          testid="jobName"
        />
        <LabeledSelectField
          name="category"
          label="Category"
          placeholder="Job Category"
          testid="jobCategory"
          options={[
            { text: "Uncategorized", value: "" },
            ...categories.map((c) => {
              return { text: c.name, value: c.id }
            }),
          ]}
        />
        <LabeledRichTextField
          name="description"
          label="Description"
          placeholder="Description"
          testid="jobDescription"
        />
      </Form>
    </>
  )
}

export default JobForm
