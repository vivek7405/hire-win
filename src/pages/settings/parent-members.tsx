import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { getSession } from "@blitzjs/auth"
import { ErrorComponent, Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React, { Suspense, useState } from "react"
import path from "path"

import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "src/guard/ability"

import ParentCompanyUserInvitationForm from "src/parent-companies/components/ParentCompanyUserInvitationForm"
import Breadcrumbs from "src/core/components/Breadcrumbs"
// import inviteToParentCompany from "src/parentCompanys/mutations/inviteToParentCompany"
import removeFromParentCompany from "src/parent-companies/mutations/removeFromParentCompany"
import getParentCompany from "src/parent-companies/queries/getParentCompany"
import ParentCompanySettingsLayout from "src/core/layouts/ParentCompanySettingsLayout"
import Modal from "src/core/components/Modal"
import Confirm from "src/core/components/Confirm"
import { ArrowSmDownIcon, ArrowSmRightIcon, XCircleIcon, XIcon } from "@heroicons/react/outline"

import db, { CompanyUserRole, ParentCompanyUserRole, User } from "db"
import updateParentCompanyUser from "src/parent-companies/mutations/updateParentCompanyUser"
import { checkPlan } from "src/companies/utils/checkPlan"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import Form from "src/core/components/Form"
import LabeledInputSelectField from "src/core/components/LabeledInputSelectField"
import getSchedulesWOPagination from "src/schedules/queries/getSchedulesWOPagination"
import getCalendars from "src/calendars/queries/getCalendars"
import getDefaultCalendarByUser from "src/calendars/queries/getDefaultCalendarByUser"
import getCompany from "src/companies/queries/getCompany"
import { titleCase } from "src/core/utils/titleCase"
import addUserToParentCompany from "src/parent-companies/mutations/addUserToParentCompany"
import { PlanName, SubscriptionStatus } from "types"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import { AuthorizationError } from "blitz"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import UpgradeMessage from "src/plans/components/UpgradeMessage"
import UserSettingsLayout from "src/core/layouts/UserSettingsLayout"
import updateAutoAddMembers from "src/parent-companies/mutations/updateAutoAddMembers"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const company = await getCompany(
    {
      where: { id: session.companyId || "0" },
    },
    { ...context.ctx }
  )

  // const currentPlan = checkPlan(company)

  const { can: canUpdate } = await Guard.can(
    "access",
    "parentCompanySettings",
    { ...context.ctx },
    {}
  )

  if (user) {
    try {
      if (canUpdate) {
        // const existingCompanyUserWhereOwner = await db.companyUser.findFirst({
        //   where: { userId: context?.ctx?.session?.userId || "0", role: CompanyUserRole.OWNER },
        //   include: { company: true },
        // })

        const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

        return {
          props: {
            user,
            parentCompanyId: company?.parentCompanyId || "0",
            canUpdate,
            activePlanName,
          } as any,
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        }
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/auth/login?next=/parentCompanys/${context?.params?.slug}/settings/members`,
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsParentMembersPage = ({
  user,
  parentCompanyId,
  canUpdate,
  activePlanName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openInvite, setOpenInvite] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  // const [inviteToParentCompanyMutation] = useMutation(inviteToParentCompany)
  const [addUserToParentCompanyMutation] = useMutation(addUserToParentCompany)
  const [removeFromParentCompanyMutation] = useMutation(removeFromParentCompany)
  const [changePermissionMutation] = useMutation(updateParentCompanyUser)
  const [openConfirmBilling, setOpenConfirmBilling] = useState(false)

  const [memberToDelete, setMemberToDelete] = useState(null as any)

  const [parentCompany] = useQuery(getParentCompany, {
    where: { id: parentCompanyId || "0" },
  })

  const [updateAutoAddMembersMutation] = useMutation(updateAutoAddMembers)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  const [openUpgradeConfirm, setOpenUpgradeConfirm] = React.useState(false)
  const [upgradeConfirmHeader, setUpgradeConfirmHeader] = useState("Upgrade to recruiter plan")
  const [upgradeConfirmMessage, setUpgradeConfirmMessage] = useState(
    "Upgrade to recruiter plan for adding more members."
  )

  return (
    <AuthLayout title="Hire.win | Parent Company Members" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <UserSettingsLayout>
          <ParentCompanySettingsLayout>
            <div className="bg-white mt-5 md:mt-0 md:col-span-2">
              <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
                  <div>
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Parent Company Members
                    </h2>
                    <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                      Add existing company users to the Hiring Team for this parent company
                    </h4>
                    <h4 className="text-xs sm:text-sm text-gray-700">
                      You may{" "}
                      <Link href={Routes.UserSettingsMembersPage()} legacyBehavior>
                        <a className="text-indigo-600 hover:text-indigo-700">
                          invite more company users
                        </a>
                      </Link>{" "}
                      from Company Members Settings
                    </h4>
                    {activePlanName === PlanName.FREE && (
                      <div className="mt-2">
                        <UpgradeMessage message="Upgrade to add more members" />
                      </div>
                    )}
                  </div>
                  <Modal
                    header="Add Member to ParentCompany"
                    open={openInvite}
                    setOpen={setOpenInvite}
                    noOverflow={true}
                  >
                    <ParentCompanyUserInvitationForm
                      header="Add Team Member"
                      subHeader="Add an existing company user to this parent company"
                      submitText="Add"
                      parentCompanyId={parentCompany?.id || "0"}
                      initialValues={{ email: "" }}
                      onSubmit={async (values) => {
                        const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                        try {
                          // await inviteToParentCompanyMutation({
                          //   parentCompanyId: parentCompanyData?.id as string,
                          //   email: values.email,
                          // })
                          await addUserToParentCompanyMutation({
                            parentCompanyId: parentCompany?.id as string,
                            email: values.email,
                            parentCompanyUserRole: values.parentCompanyUserRole,
                          })
                          toast.success(() => <span>User added</span>, { id: toastId })
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString(),
                            { id: toastId }
                          )
                        }
                        setOpenInvite(false)
                        router.reload()
                      }}
                    />
                  </Modal>

                  <Confirm
                    open={openConfirmBilling}
                    setOpen={setOpenConfirmBilling}
                    header="Upgrade to the Recruiter Plan?"
                    onSuccess={async () => {
                      router.push(Routes.UserSettingsBillingPage())
                    }}
                  >
                    Upgrade to the Recruiter Plan to add unlimited users. You cannot add users on
                    the Free plan.
                  </Confirm>

                  <Confirm
                    open={openUpgradeConfirm}
                    setOpen={setOpenUpgradeConfirm}
                    header={upgradeConfirmHeader}
                    cancelText="Ok"
                    hideConfirm={true}
                    onSuccess={async () => {
                      setOpenUpgradeConfirm(false)
                    }}
                  >
                    {upgradeConfirmMessage}
                  </Confirm>

                  <Confirm
                    open={openConfirmDelete}
                    setOpen={setOpenConfirmDelete}
                    header={"Delete Member?"}
                    onSuccess={async () => {
                      if (!memberToDelete) {
                        toast.error("No member selected to remove")
                        return
                      }

                      const toastId = toast.loading(`Removing ${memberToDelete?.user?.email}`)
                      try {
                        await removeFromParentCompanyMutation({
                          parentCompanyId: parentCompany?.id as string,
                          userId: memberToDelete?.user?.id,
                        })
                        toast.success(`User removed`, {
                          id: toastId,
                        })
                        router.reload()
                      } catch (error) {
                        toast.error(
                          `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
                          { id: toastId }
                        )
                      }

                      setMemberToDelete(null)
                    }}
                  >
                    Are you sure you want to remove this user ({memberToDelete?.user?.name}) from
                    the parent company?
                  </Confirm>

                  <button
                    onClick={(e) => {
                      e.preventDefault()

                      if (activePlanName === PlanName.FREE) {
                        setUpgradeConfirmHeader("Upgrade to recruiter plan")
                        setUpgradeConfirmMessage(
                          "Upgrade to recruiter plan for adding more members."
                        )
                        setOpenInvite(false)
                        setOpenUpgradeConfirm(true)
                        return
                      }
                      // else if (activePlanName === PlanName.LIFETIME_SET1) {
                      //   if (parentCompanyData?.users?.length >= LIFETIME_SET1_MEMBERS_LIMIT) {
                      //     setUpgradeConfirmHeader("Members limit reached")
                      //     setUpgradeConfirmMessage(
                      //       `The lifetime plan allows upto ${LIFETIME_SET1_MEMBERS_LIMIT} users to collaborate. Since this parentCompany already has ${LIFETIME_SET1_MEMBERS_LIMIT} members added, you can't add a new member.`
                      //     )
                      //     setOpenInvite(false)
                      //     setOpenUpgradeConfirm(true)
                      //     return
                      //   }
                      // }

                      // if (checkSubscription(company)) {
                      setOpenInvite(true)
                      // } else {
                      //   setOpenConfirmBilling(true)
                      // }
                    }}
                    data-testid={`open-inviteUser-modal`}
                    className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
                  >
                    Add Member
                  </button>
                </div>

                <div className="overflow-auto">
                  <div className="flex items-center space-x-2 text-neutral-700">
                    <input
                      id="auto-add-checkbox"
                      type="checkbox"
                      checked={parentCompany?.autoAddUsersToCompanies || false}
                      className="border rounded"
                      onChange={async (e) => {
                        const isAutoAdd = e.target.checked
                        const toastId = toast.loading("Updating auto add")

                        try {
                          await updateAutoAddMembersMutation({
                            parentCompanyId,
                            autoAddUsersToCompanies: isAutoAdd,
                          })

                          await invalidateQuery(getParentCompany)

                          toast.success(isAutoAdd ? "Auto add turned on" : "Auto add turned off", {
                            id: toastId,
                          })
                        } catch (error) {
                          toast.error(`Something went wrong - ${error.toString()}`, { id: toastId })
                        }
                      }}
                    />
                    <label htmlFor="auto-add-checkbox">
                      Auto add all parent company members as admins to newly created companies
                    </label>
                  </div>
                  <table className="table min-w-full border border-gray-200 mt-6">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentCompany?.users?.map((m, i) => {
                        return (
                          <tr className="bg-white" key={i}>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                              data-testid={`parentCompany-member-${m.user.email}`}
                            >
                              {m.user.name}
                            </td>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                              data-testid={`parentCompany-member-${m.user.email}`}
                            >
                              {m.user.email}
                            </td>
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                              data-testid={`parentCompany-member-${m.user.email}`}
                            >
                              {m.userId === user?.id || m.role === "OWNER" ? (
                                titleCase(m.role)
                              ) : (
                                <select
                                  defaultValue={m.role}
                                  className="border border-gray-300 px-2 py-2 block sm:text-sm rounded w-24 truncate pr-6"
                                  onChange={async (e) => {
                                    const toastId = toast.loading("Updating member permission")
                                    try {
                                      await changePermissionMutation({
                                        where: {
                                          id: m.id,
                                        },
                                        data: {
                                          role: ParentCompanyUserRole[e.target.value],
                                        },
                                      })
                                      toast.success("Member updated", { id: toastId })
                                    } catch (e) {
                                      toast.error(
                                        `Sorry, we had an unexpected error. Please try again. - ${e.toString()}`
                                      )
                                    }
                                  }}
                                >
                                  {Object.values(ParentCompanyUserRole)
                                    ?.filter((m) => m !== "OWNER")
                                    ?.map((m, i) => {
                                      return (
                                        <option key={i} value={m}>
                                          {titleCase(m)}
                                        </option>
                                      )
                                    })}
                                </select>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                              {canUpdate && user?.id !== m.user.id && m.role !== "OWNER" && (
                                <>
                                  <button
                                    data-testid={`remove-${m.user.email}-fromParentCompany`}
                                    title="Remove User"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={async (e) => {
                                      e.preventDefault()
                                      setMemberToDelete(m)
                                      setOpenConfirmDelete(true)
                                    }}
                                  >
                                    <XIcon className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ParentCompanySettingsLayout>
        </UserSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default UserSettingsParentMembersPage
