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
import getCompanyUsersListForInvitation from "src/companies/queries/getCompanyUsersListForInvitation"
import { CompanyUserRole, JobUserRole } from "@prisma/client"
import { titleCase } from "src/core/utils/titleCase"
import { ArrowRightIcon } from "@heroicons/react/outline"

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
            <Link href={Routes.UserSettingsMembersPage()} legacyBehavior>
              <a className="flex items-center space-x-2 text-sm text-neutral-700 hover:text-black">
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
              subLabel="Admins can add/update jobs, company info, job categories, email templates & candidate pools"
              subLabel2="Users can only access assigned jobs and their personal profile settings"
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
