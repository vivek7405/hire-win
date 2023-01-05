import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { z } from "zod"
import getParentCompanyUsers from "../queries/getParentCompanyUsers"
import { useEffect } from "react"
import getCompanyUsersListForParentCompanyInvitation from "src/parent-companies/queries/getCompanyUsersListForParentCompanyInvitation"
import { ParentCompanyUserRole } from "@prisma/client"
import { titleCase } from "src/core/utils/titleCase"
import { ArrowRightIcon } from "@heroicons/react/outline"

type InvitationFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  parentCompanyId?: string
  header?: string
  subHeader?: string
  submitText?: string
}

export const ParentCompanyUserInvitationForm = (props: InvitationFormProps) => {
  const [parentCompanyUsers] = useQuery(getCompanyUsersListForParentCompanyInvitation, {
    parentCompanyId: props.parentCompanyId,
  })

  return (
    <>
      <Form
        header={props.header || "Invite a User"}
        subHeader={props.subHeader || `Add a new member to the Parent Company.`}
        submitText={props.submitText || "Add User"}
        schema={z.object({
          email: z.string().email().nonempty({ message: "Required" }),
          parentCompanyUserRole: z.nativeEnum(ParentCompanyUserRole),
        })}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
        <>
          <Link href={Routes.UserSettingsMembersPage()} legacyBehavior>
            <a className="w-fit flex items-center space-x-2 text-sm text-theme-600 hover:text-theme-800">
              <div>View/Invite Parent Company Users</div>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </Link>
          <LabeledReactSelectField
            label="User"
            name="email"
            options={parentCompanyUsers?.map((cu) => {
              return { label: `${cu.user?.name} - ${cu.user?.email}`, value: cu.user?.email }
            })}
            placeholder="Select a user to add"
          />
          <LabeledReactSelectField
            name="parentCompanyUserRole"
            label="Role"
            subLabel="Admins can add/update hiring team, email templates, candidate pools, etc."
            subLabel2="Users can only access the already added email templates & candidate pools"
            placeholder="Select Parent Company Role"
            options={Object.values(ParentCompanyUserRole)
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

export default ParentCompanyUserInvitationForm
