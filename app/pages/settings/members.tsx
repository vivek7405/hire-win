import React, { useState } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useRouter,
  useMutation,
  AuthorizationError,
  ErrorComponent,
  getSession,
  Routes,
  useQuery,
  invalidateQuery,
} from "blitz"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "app/guard/ability"

import InvitationForm from "app/jobs/components/InvitationForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import inviteToJob from "app/jobs/mutations/inviteToJob"
import removeFromJob from "app/jobs/mutations/removeFromJob"
import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"
import Modal from "app/core/components/Modal"
import Confirm from "app/core/components/Confirm"
import { ArrowSmDownIcon, ArrowSmRightIcon, XCircleIcon, XIcon } from "@heroicons/react/outline"

import { CompanyUser, CompanyUserRole, Token, User } from "db"
// import updateMemberRole from "app/jobs/mutations/updateMemberRole"
import { checkPlan } from "app/companies/utils/checkPlan"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import Form from "app/core/components/Form"
import assignInterviewerToJobStage from "app/jobs/mutations/assignInterviewerToJobStage"
import LabeledInputSelectField from "app/core/components/LabeledInputSelectField"
import getSchedulesWOPagination from "app/scheduling/schedules/queries/getSchedulesWOPagination"
import getCalendars from "app/scheduling/calendars/queries/getCalendars"
import getDefaultCalendarByUser from "app/scheduling/calendars/queries/getDefaultCalendarByUser"
import assignScheduleToJobStage from "app/jobs/mutations/assignScheduleToJobStage"
import assignCalendarToJobStage from "app/jobs/mutations/assignCalendarToJobStage"
import getCompany from "app/companies/queries/getCompany"
import UserSettingsLayout from "app/core/layouts/UserSettingsLayout"
import inviteToCompany from "app/companies/mutations/inviteToCompany"
import updateCompanyUserRole from "app/companies/mutations/updateCompanyUserRole"
import removeFromCompany from "app/companies/mutations/removeFromCompany"
import { titleCase } from "app/core/utils/titleCase"
import { SubscriptionStatus } from "types"
import { checkSubscription } from "app/companies/utils/checkSubscription"
import getPendingCompanyInviteTokens from "app/tokens/queries/getPendingCompanyInviteTokens"
import updateCompanyUserRoleInToken from "app/tokens/mutations/updateCompanyUserRoleInToken"
import deleteToken from "app/tokens/mutations/deleteToken"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const { can: canUpdate } = await Guard.can(
    "update",
    "company",
    { session },
    { where: { id: session?.companyId || "0" } }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "company",
    { session },
    { where: { id: session?.companyId || "0" } }
  )

  const { can: isAdmin } = await Guard.can(
    "isAdmin",
    "company",
    { session },
    { where: { id: session?.companyId || "0" } }
  )

  if (user) {
    try {
      if (isOwner || isAdmin) {
        const company = await invokeWithMiddleware(
          getCompany,
          {
            where: { id: session.companyId || "0" },
          },
          { ...context }
        )

        const pendingInviteTokens = await invokeWithMiddleware(
          getPendingCompanyInviteTokens,
          {
            where: { companyId: session.companyId || "0" },
          },
          { ...context }
        )

        // const currentPlan = checkPlan(company)

        return {
          props: {
            user: user,
            company,
            pendingInviteTokens,
            canUpdate,
            isOwner,
          },
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
        destination: `/login?next=/jobs/${context?.params?.slug}/settings/members`,
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsMembersPage = ({
  user,
  company,
  pendingInviteTokens,
  canUpdate,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openInvite, setOpenInvite] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  const [openConfirmWithdraw, setOpenConfirmWithdraw] = useState(false)
  const [inviteToCompanyMutation] = useMutation(inviteToCompany)
  const [removeFromCompanyMutation] = useMutation(removeFromCompany)
  const [deleteTokenMutation] = useMutation(deleteToken)
  const [changePermissionMutation] = useMutation(updateCompanyUserRole)
  const [updateCompanyUserRoleInTokenMutation] = useMutation(updateCompanyUserRoleInToken)
  const [openConfirmBilling, setOpenConfirmBilling] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(
    null as (CompanyUser & { user: User }) | null
  )
  const [tokenToDelete, setTokenToDelete] = useState(null as Token | null)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <UserSettingsLayout>
        <div className="bg-white md:col-span-2">
          <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2
                id="billing-history-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Members
              </h2>
              <Modal
                noOverflow={true}
                header="Invite A User"
                open={openInvite}
                setOpen={setOpenInvite}
              >
                <InvitationForm
                  isJobInvitation={false}
                  initialValues={{ email: "" }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                    try {
                      await inviteToCompanyMutation({
                        companyId: company?.id || "0",
                        email: values.email,
                        companyUserRole: values.companyUserRole,
                      })
                      setOpenInvite(false)
                      toast.success(() => <span>{values.email} invited</span>, { id: toastId })
                      router.reload()
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                        { id: toastId }
                      )
                    }
                  }}
                />
              </Modal>
              <Confirm
                open={openConfirmBilling}
                setOpen={setOpenConfirmBilling}
                header="Upgrade to the Pro Plan?"
                onSuccess={async () => {
                  router.push(Routes.UserSettingsBillingPage())
                }}
              >
                Upgrade to the Pro Plan to invite unlimited users. You cannot invite users on the
                Free plan.
              </Confirm>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (checkSubscription(company)) {
                    setOpenInvite(true)
                  } else {
                    setOpenConfirmBilling(true)
                  }
                }}
                className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Invite User
              </button>
            </div>

            <div className="flex flex-col overflow-auto rounded-sm">
              <table className="table min-w-full border border-gray-200">
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
                  {company?.users?.map((m) => {
                    return (
                      <tr className="bg-white" key={m.id}>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                          data-testid={`job-member-${m.user.email}`}
                        >
                          {m.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                          {m.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                          {m.userId === user?.id || m.role === "OWNER" ? (
                            titleCase(m.role)
                          ) : (
                            <select
                              defaultValue={m.role}
                              className="border border-gray-300 px-2 py-2 block w-32 sm:text-sm rounded truncate pr-6"
                              onChange={async (e) => {
                                const toastId = toast.loading(() => (
                                  <span>Updating member permission</span>
                                ))
                                try {
                                  await changePermissionMutation({
                                    where: {
                                      id: m.id,
                                    },
                                    data: {
                                      role: CompanyUserRole[e.target.value],
                                    },
                                  })
                                  toast.success(() => <span>Member updated</span>, { id: toastId })
                                  router.reload()
                                } catch (e) {
                                  toast.error(
                                    `Sorry, we had an unexpected error. Please try again. - ${e.toString()}`,
                                    { id: toastId }
                                  )
                                }
                              }}
                            >
                              {Object.values(CompanyUserRole)
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
                              <Confirm
                                open={openConfirmDelete}
                                setOpen={setOpenConfirmDelete}
                                header={`Delete Member - ${memberToDelete?.user?.name}?`}
                                onSuccess={async () => {
                                  const toastId = toast.loading(() => (
                                    <span>Removing {memberToDelete?.user?.name}</span>
                                  ))
                                  try {
                                    await removeFromCompanyMutation({
                                      companyId: company?.id || "0",
                                      userId: memberToDelete?.user?.id || "0",
                                    })
                                    toast.success(`${memberToDelete?.user?.name} removed`, {
                                      id: toastId,
                                    })
                                  } catch (error) {
                                    toast.error(
                                      `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
                                      { id: toastId }
                                    )
                                  }
                                  setMemberToDelete(null as any)
                                  router.reload()
                                }}
                              >
                                Are you sure you want to remove this user from the company?
                              </Confirm>

                              <button
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
            {(pendingInviteTokens?.length || 0) > 0 && (
              <div>
                <p className="mt-10 font-medium text-lg">Pending Invites</p>
                <table className="mt-7 table min-w-full border border-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
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
                    {pendingInviteTokens?.map((m) => {
                      return (
                        <tr className="bg-white" key={m.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                            {m.sentTo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                            {m.companyUserRole === "OWNER" ? (
                              titleCase(m.companyUserRole)
                            ) : (
                              <select
                                defaultValue={m.companyUserRole?.toString()}
                                className="border border-gray-300 px-2 py-2 block w-32 sm:text-sm rounded truncate pr-6"
                                onChange={async (e) => {
                                  const toastId = toast.loading(() => <span>Updating role</span>)
                                  try {
                                    await updateCompanyUserRoleInTokenMutation({
                                      where: {
                                        id: m.id,
                                      },
                                      data: {
                                        companyUserRole: CompanyUserRole[e.target.value],
                                      },
                                    })
                                    // await changePermissionMutation({
                                    //   where: {
                                    //     id: m.id,
                                    //   },
                                    //   data: {
                                    //     role: CompanyUserRole[e.target.value],
                                    //   },
                                    // })
                                    toast.success(() => <span>Role updated</span>, { id: toastId })
                                    router.reload()
                                  } catch (e) {
                                    toast.error(
                                      `Sorry, we had an unexpected error. Please try again. - ${e.toString()}`,
                                      { id: toastId }
                                    )
                                  }
                                }}
                              >
                                {Object.values(CompanyUserRole)
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
                            {user?.id !== m.id && (
                              <>
                                <Confirm
                                  open={openConfirmWithdraw}
                                  setOpen={setOpenConfirmWithdraw}
                                  header={`Withdraw invite to ${tokenToDelete?.sentTo}?`}
                                  onSuccess={async () => {
                                    const toastId = toast.loading(() => (
                                      <span>Removing {tokenToDelete?.sentTo}</span>
                                    ))
                                    try {
                                      // await removeFromCompanyMutation({
                                      //   companyId: company?.id || "0",
                                      //   userId: memberToDelete?.user?.id,
                                      // })
                                      await deleteTokenMutation({ where: { id: m.id || "0" } })
                                      toast.success(`${tokenToDelete?.sentTo} removed`, {
                                        id: toastId,
                                      })
                                    } catch (error) {
                                      toast.error(
                                        `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
                                        { id: toastId }
                                      )
                                    }
                                    setTokenToDelete(null as any)
                                    router.reload()
                                  }}
                                >
                                  Are you sure you want to withdraw this invite?
                                </Confirm>

                                <button
                                  title="Remove User"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={async (e) => {
                                    e.preventDefault()
                                    setTokenToDelete(m)
                                    setOpenConfirmWithdraw(true)
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
            )}
          </div>
        </div>
      </UserSettingsLayout>
    </AuthLayout>
  )
}

export default UserSettingsMembersPage
