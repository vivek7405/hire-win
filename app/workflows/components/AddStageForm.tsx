import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import getStagesWOPagination from "app/stages/queries/getStagesWOPagination"
import { useQuery } from "blitz"
import getWorkflowStagesWOPagination from "../queries/getWorkflowStagesWOPagination"

type AddStageFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  user: any
  schema: any
  workflowId: string
}

export const AddStageForm = (props: AddStageFormProps) => {
  debugger
  const [workflowStages] = useQuery(getWorkflowStagesWOPagination, {
    where: { workflowId: props.workflowId },
  })
  const [stages] = useQuery(getStagesWOPagination, {
    where: {
      userId: props.user?.id,
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
        header="Add Stage"
        subHeader="Add an existing stage to the workflow"
        submitText="Add"
        submitDisabled={stages?.length ? false : true}
        schema={props.schema}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addStageForm"
      >
        <LabeledSelectField
          name="stageId"
          label="Stages"
          placeholder="Workflow Stage"
          testid="workflowStage"
          options={
            stages?.length
              ? [
                  ...stages.map((c) => {
                    return { text: c.name, value: c.id }
                  }),
                ]
              : [{ text: "No more stages to add", value: "" }]
          }
        />
      </Form>
    </>
  )
}

export default AddStageForm