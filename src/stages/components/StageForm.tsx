import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import { StageObj } from "src/stages/validations"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import LabeledSelectField from "src/core/components/LabeledSelectField"
import { useQuery } from "@blitzjs/rpc"
import getJobMembers from "src/jobs/queries/getJobMembers"

type StageFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
  jobId: string
}

export const StageForm = (props: StageFormProps) => {
  const [job] = useQuery(getJobMembers, { where: { id: props.jobId } })

  return (
    <>
      <Form
        submitText="Submit"
        schema={StageObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="stageForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField type="text" name="name" label="Name" placeholder="Stage Name" />
        <LabeledReactSelectField
          name="interviewerId"
          label="Interviewer"
          options={job?.users?.map((jobUser) => {
            return { label: jobUser?.user?.name, value: jobUser?.userId }
          })}
        />
        <LabeledReactSelectField
          name="duration"
          label="Interview Duration"
          options={[
            { label: "15 Minutes", value: "15" },
            { label: "30 Minutes", value: "30" },
            { label: "45 Minutes", value: "45" },
            { label: "60 Minutes", value: "60" },
          ]}
        />
      </Form>
    </>
  )
}

export default StageForm
