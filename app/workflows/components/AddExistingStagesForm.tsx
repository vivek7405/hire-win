import { LabeledTextField } from "app/core/components/LabeledTextField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import getStagesWOPagination from "app/stages/queries/getStagesWOPagination"
import { useQuery } from "blitz"
import getWorkflowStagesWOPagination from "../queries/getWorkflowStagesWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import Form from "app/core/components/Form"

type AddStageFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  // user: any
  companyId: string
  schema: any
  workflowId: string
}

export const AddExistingStagesForm = (props: AddStageFormProps) => {
  const [workflowStages] = useQuery(getWorkflowStagesWOPagination, {
    where: { workflowId: props.workflowId },
  })
  const [stages] = useQuery(getStagesWOPagination, {
    where: {
      companyId: props.companyId || "0",
      slug: {
        notIn: workflowStages.map((ws) => {
          return ws.stage.slug
        }),
      },
    },
  })
  return (
    <>
      <Form
        header="Add Stages"
        subHeader="Add existing stages to the workflow"
        submitText="Add"
        submitDisabled={stages?.length ? false : true}
        schema={props.schema}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addStageWorkflow"
      >
        <LabeledReactSelectField
          name="stageIds"
          label="Stages"
          placeholder="Select Stages"
          testid="workflowStages"
          isMulti={true}
          options={
            stages?.length
              ? [
                  ...stages.map((c) => {
                    return { label: c.name, value: c.id }
                  }),
                ]
              : [{ label: "No more stages to add", value: "" }]
          }
        />
      </Form>
    </>
  )
}

export default AddExistingStagesForm
