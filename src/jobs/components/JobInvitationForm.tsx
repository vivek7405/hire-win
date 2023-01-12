import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { z } from "zod"
import getJobUsers from "../queries/getJobUsers"
import { useEffect } from "react"
import getCompanyUsersListForJobInvitation from "src/companies/queries/getCompanyUsersListForJobInvitation"
import { CompanyUserRole, JobUserRole } from "@prisma/client"
import { titleCase } from "src/core/utils/titleCase"
import { ArrowRightIcon } from "@heroicons/react/outline"

type JobInvitationFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  jobId?: string
  header?: string
  subHeader?: string
  submitText?: string
}

export const JobInvitationForm = (props: JobInvitationFormProps) => {
  const [companyUsers] = useQuery(getCompanyUsersListForJobInvitation, {
    jobId: props.jobId,
  })

  return (
    <>
      <Form
        header={props.header || "Invite a User"}
        subHeader={
          props.subHeader ||
          `Add a new member to the Job. An email notification will be sent to the user.`
        }
        submitText={props.submitText || "Invite"}
        schema={z.object({
          email: z.string().email().nonempty({ message: "Required" }),
          jobUserRole: z.nativeEnum(JobUserRole),
        })}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
        <>
          <Link href={Routes.UserSettingsMembersPage()} legacyBehavior>
            <a className="w-fit flex items-center space-x-2 text-sm text-theme-600 hover:text-theme-800">
              <div>View/Invite Company Users</div>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </Link>
          <LabeledReactSelectField
            label="User"
            name="email"
            options={companyUsers?.map((cu) => {
              return { label: `${cu.user?.name} - ${cu.user?.email}`, value: cu.user?.email }
            })}
            placeholder="Select a user to add"
          />
          <LabeledReactSelectField
            name="jobUserRole"
            label="Role"
            subLabel="Admins can add/update hiring team, assign interviewers, organize interviews & add/update candidates"
            subLabel2="Users can only conduct interviews and provide candidate score"
            placeholder="Select Job Role"
            options={Object.values(JobUserRole)
              ?.filter((m) => m !== "OWNER")
              ?.map((m, i) => {
                return { label: titleCase(m), value: m }
              })}
          />
        </>
      </Form>
    </>
  )
}

export default JobInvitationForm
