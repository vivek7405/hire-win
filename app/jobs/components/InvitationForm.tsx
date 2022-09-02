import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { invalidateQuery, useQuery, useSession } from "blitz"
import getCompanyUsers from "app/companies/queries/getCompanyUsers"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import { z } from "zod"
import getJobUsers from "../queries/getJobUsers"
import { useEffect } from "react"
import getCompanyUsersListForInvitation from "app/companies/queries/getCompanyUsersListForInvitation"

type InvitationFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  isJobInvitation: boolean
  jobId?: string
  header?: string
  subHeader?: string
  submitText?: string
}

export const InvitationForm = (props: InvitationFormProps) => {
  const [companyUsers] = useQuery(getCompanyUsersListForInvitation, {
    jobId: props.jobId,
  })

  return (
    <>
      <Form
        header={props.header || "Invite a User"}
        subHeader={
          props.subHeader ||
          `Invite a new member to the ${
            props.isJobInvitation ? "Job" : "Company"
          }. An email will be sent to the user.`
        }
        submitText={props.submitText || "Invite"}
        schema={z.object({
          email: z.string().email().nonempty({ message: "Required" }),
        })}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
        {props.isJobInvitation ? (
          <LabeledReactSelectField
            name="email"
            options={companyUsers?.map((cu) => {
              return { label: `${cu.user?.name} - ${cu.user?.email}`, value: cu.user?.email }
            })}
            placeholder="Select a user to add"
          />
        ) : (
          <LabeledTextField
            name="email"
            type="email"
            label="Email"
            placeholder="partner@company.com"
            testid="inviteEmail"
          />
        )}
      </Form>
    </>
  )
}

export default InvitationForm
