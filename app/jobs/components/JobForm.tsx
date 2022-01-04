import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import { Category, Workflow } from "@prisma/client"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  workflow?: Workflow // Need to be provided while editing the form
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
        <LabeledReactSelectField
          name="categoryId"
          label="Category"
          placeholder="Job Category"
          testid="jobCategory"
          disabled={props.category && !categories.find((c) => c.id === props.category?.id)}
          // defaultValue={props.initialValues?.categoryId}
          options={
            !props.category || categories.find((c) => c.id === props.category?.id)
              ? [
                  { label: "Uncategorized", value: "" },
                  ...categories.map((c) => {
                    return { label: c.name!, value: c.id! }
                  }),
                ]
              : [{ label: props.category?.name!, value: props.category?.id! }]
          }
        />
        <LabeledReactSelectField
          name="workflowId"
          label="Workflow"
          placeholder="Job Workflow"
          testid="jobWorkflow"
          disabled={props.workflow && !workflows.find((c) => c.id === props.workflow?.id)}
          // defaultValue={props.initialValues?.workflowId}
          options={
            !props.workflow || workflows.find((c) => c.id === props.workflow?.id)
              ? [
                  { label: "Default", value: "" },
                  ...workflows.map((w) => {
                    return { label: w.name!, value: w.id! }
                  }),
                ]
              : [{ label: props.workflow?.name!, value: props.workflow?.id! }]
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
