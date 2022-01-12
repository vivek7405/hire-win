import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form as InputForm } from "app/core/components/Form"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import { Category, Workflow, Form } from "@prisma/client"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import getFormsWOPagination from "app/forms/queries/getFormsWOPagination"

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  workflow?: Workflow // Need to be provided while editing the form
  form?: Form // Need to be provided while editing the form
}

export const JobForm = (props: JobFormProps) => {
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: props.user?.id } })
  const [workflows] = useQuery(getWorkflowsWOPagination, { where: { userId: props.user?.id } })
  const [forms] = useQuery(getFormsWOPagination, { where: { userId: props.user?.id } })

  return (
    <>
      <InputForm
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
                  // { label: "Default", value: "" },
                  ...categories.map((c) => {
                    return { label: c.name!, value: c.id! }
                  }),
                ]
              : [{ label: props.category?.name!, value: props.category?.id! }]
          }
        />
        <LabeledReactSelectField
          name="workflowId"
          label="Interview Workflow"
          placeholder="Interview Workflow"
          testid="jobWorkflow"
          disabled={props.workflow && !workflows.find((c) => c.id === props.workflow?.id)}
          // defaultValue={props.initialValues?.workflowId}
          options={
            !props.workflow || workflows.find((w) => w.id === props.workflow?.id)
              ? [
                  // { label: "Default", value: "" },
                  ...workflows.map((w) => {
                    return { label: w.name!, value: w.id! }
                  }),
                ]
              : [{ label: props.workflow?.name!, value: props.workflow?.id! }]
          }
        />
        <LabeledReactSelectField
          name="formId"
          label="Application Form"
          placeholder="Job Application Form"
          testid="jobForm"
          disabled={props.form && !forms.find((c) => c.id === props.workflow?.id)}
          // defaultValue={props.initialValues?.workflowId}
          options={
            !props.form || forms.find((f) => f.id === props.form?.id)
              ? [
                  // { label: "Default", value: "" },
                  ...forms.map((f) => {
                    return { label: f.name!, value: f.id! }
                  }),
                ]
              : [{ label: props.form?.name!, value: props.form?.id! }]
          }
        />
        <LabeledRichTextField
          name="description"
          label="Description"
          placeholder="Description"
          testid="jobDescription"
        />
      </InputForm>
    </>
  )
}

export default JobForm
