import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import { Category, Workflow } from "@prisma/client"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category
  workflow?: Workflow
}

export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: props.user?.id } })
  const [workflows] = useQuery(getWorkflowsWOPagination, { where: { userId: props.user?.id } })

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
          name="categoryId"
          label="Category"
          placeholder="Job Category"
          testid="jobCategory"
          disabled={props.category && !categories.find((c) => c.id === props.category?.id)}
          options={
            !props.category || categories.find((c) => c.id === props.category?.id)
              ? [
                  { text: "Uncategorized", value: "" },
                  ...categories.map((c) => {
                    return { text: c.name!, value: c.id! }
                  }),
                ]
              : [{ text: props.category?.name!, value: props.category?.id! }]
          }
        />
        <LabeledSelectField
          name="workflowId"
          label="Workflow"
          placeholder="Job Workflow"
          testid="jobWorkflow"
          disabled={props.workflow && !workflows.find((c) => c.id === props.workflow?.id)}
          options={
            !props.workflow || workflows.find((c) => c.id === props.workflow?.id)
              ? [
                  { text: "Default", value: "" },
                  ...workflows.map((w) => {
                    return { text: w.name!, value: w.id! }
                  }),
                ]
              : [{ text: props.workflow?.name!, value: props.workflow?.id! }]
          }
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
