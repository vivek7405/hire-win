import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { invalidateQuery, useQuery, useSession } from "blitz"
import getCompanyUsers from "app/companies/queries/getCompanyUsers"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import { z } from "zod"
import getJobUsers from "../queries/getJobUsers"
import { useEffect } from "react"
import getCompanyUsersListForInvitation from "app/companies/queries/getCompanyUsersListForInvitation"
import { CompanyUserRole, JobUserRole } from "@prisma/client"
import { titleCase } from "app/core/utils/titleCase"

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
        schema={
          props.isJobInvitation
            ? z.object({
                email: z.string().email().nonempty({ message: "Required" }),
                jobUserRole: z.nativeEnum(JobUserRole),
              })
            : z.object({
                email: z.string().email().nonempty({ message: "Required" }),
                companyUserRole: z.nativeEnum(CompanyUserRole),
              })
        }
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
        {props.isJobInvitation ? (
          <>
            <LabeledReactSelectField
              name="email"
              options={companyUsers?.map((cu) => {
                return { label: `${cu.user?.name} - ${cu.user?.email}`, value: cu.user?.email }
              })}
              placeholder="Select a user to add"
            />
            <LabeledReactSelectField
              name="jobUserRole"
              label="Role"
              placeholder="Select Job Role"
              options={Object.values(JobUserRole)
                ?.filter((m) => m !== "OWNER")
                ?.map((m, i) => {
                  return { label: titleCase(m), value: m }
                })}
            />
          </>
        ) : (
          <>
            <LabeledTextField
              name="email"
              type="email"
              label="Email"
              placeholder="partner@company.com"
              testid="inviteEmail"
            />
            <LabeledReactSelectField
              name="companyUserRole"
              label="Role"
              placeholder="Select Company Role"
              options={Object.values(CompanyUserRole)
                ?.filter((m) => m !== "OWNER")
                ?.map((m, i) => {
                  return { label: titleCase(m), value: m }
                })}
            />
          </>
        )}
      </Form>
    </>
  )
}

export default InvitationForm
