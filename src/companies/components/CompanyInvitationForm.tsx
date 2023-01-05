import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { z } from "zod"
import { useEffect, useState } from "react"
import getCompanyUsersListForJobInvitation from "src/companies/queries/getCompanyUsersListForJobInvitation"
import { CompanyUserRole, JobUserRole, ParentCompanyUserRole } from "@prisma/client"
import { titleCase } from "src/core/utils/titleCase"
import { ArrowRightIcon } from "@heroicons/react/outline"
import getParentCompany from "src/parent-companies/queries/getParentCompany"
import { useSession } from "@blitzjs/auth"

type CompanyInvitationFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  parentCompanyId: string
  parentCompanyName: string
  header?: string
  subHeader?: string
  submitText?: string
}

export const CompanyInvitationForm = (props: CompanyInvitationFormProps) => {
  const [addUserToParentCompany, setAddUserToParentCompany] = useState(false)

  return (
    <>
      <Form
        header={props.header || "Invite a User"}
        subHeader={
          props.subHeader ||
          `Invite a new member to the Company. An email will be sent to the user.`
        }
        submitText={props.submitText || "Invite"}
        schema={z.object({
          email: z.string().email().nonempty({ message: "Required" }),
          companyUserRole: z.nativeEnum(CompanyUserRole),
          parentCompanyId: z.string().optional(),
          parentCompanyUserRole: z.nativeEnum(ParentCompanyUserRole).optional(),
        })}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="inviteForm"
      >
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
            label="Company Role"
            subLabel="Admins can add/update jobs, company info, job categories, email templates & candidate pools"
            subLabel2="Users can only access assigned jobs and their personal profile settings"
            placeholder="Select Company Role"
            options={Object.values(CompanyUserRole)
              ?.filter((m) => m !== "OWNER")
              ?.map((m, i) => {
                return { label: titleCase(m), value: m }
              })}
          />
          {props.parentCompanyName && (
            <div className="flex items-center space-x-2">
              <input
                id="addToParentCompanyCheckbox"
                type="checkbox"
                className="rounded"
                onChange={() => {
                  setAddUserToParentCompany(!addUserToParentCompany)
                }}
              />
              <label htmlFor="addToParentCompanyCheckbox" className="text-sm text-neutral-700">
                Add user to parent company
              </label>
            </div>
          )}
          {addUserToParentCompany && (
            <LabeledTextField
              type="hidden"
              name="parentCompanyId"
              value={props.parentCompanyId || undefined}
            />
          )}
          {addUserToParentCompany && (
            <LabeledReactSelectField
              name="parentCompanyUserRole"
              label="Parent Company Role"
              subLabel="Admins can add/update parent company info, email templates & candidate pools"
              subLabel2="Users can only use the email templates & candidate pools that are already setup"
              placeholder="Select Parent Company Role"
              options={Object.values(ParentCompanyUserRole)
                ?.filter((m) => m !== "OWNER")
                ?.map((m, i) => {
                  return { label: titleCase(m), value: m }
                })}
            />
          )}
        </>
      </Form>
    </>
  )
}

export default CompanyInvitationForm
