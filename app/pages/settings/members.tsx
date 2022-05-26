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
import { ArrowSmDownIcon, ArrowSmRightIcon, XCircleIcon } from "@heroicons/react/outline"

import { CompanyUser, CompanyUserRole, JobUserRole, User } from "db"
// import updateMemberRole from "app/jobs/mutations/updateMemberRole"
import { checkPlan } from "app/users/utils/checkPlan"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
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
    { where: { id: session?.companyId || 0 } }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "company",
    { session },
    { where: { id: session?.companyId || 0 } }
  )

  const { can: isAdmin } = await Guard.can(
    "isAdmin",
    "company",
    { session },
    { where: { id: session?.companyId || 0 } }
  )

  if (user) {
    try {
      if (isOwner || isAdmin) {
        const company = await invokeWithMiddleware(
          getCompany,
          {
            where: { id: session.companyId || 0 },
          },
          { ...context }
        )

        const currentPlan = checkPlan(company)

        return {
          props: {
            user: user,
            company,
            canUpdate,
            currentPlan,
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
  canUpdate,
  currentPlan,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openInvite, setOpenInvite] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  const [inviteToCompanyMutation] = useMutation(inviteToCompany)
  const [removeFromCompanyMutation] = useMutation(removeFromCompany)
  const [changePermissionMutation] = useMutation(updateCompanyUserRole)
  const [openConfirmBilling, setOpenConfirmBilling] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null as any as CompanyUser & { user: User })

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <UserSettingsLayout>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2
                id="billing-history-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Members
              </h2>
              <Modal header="Invite A User" open={openInvite} setOpen={setOpenInvite}>
                <InvitationForm
                  header="Invite a User"
                  subheader="Invite a new member to the company. An email will be sent to the user."
                  initialValues={{ email: "" }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                    try {
                      await inviteToCompanyMutation({
                        companyId: company?.id as number,
                        email: values.email,
                      })
                      setOpenInvite(false)
                      toast.success(() => <span>{values.email} invited</span>, { id: toastId })
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
                  if (currentPlan) {
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
                  {company?.users.map((m) => {
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
                            m.role
                          ) : (
                            <select
                              value={m.role}
                              className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
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
                                    "Sorry, we had an unexpected error. Please try again. - " +
                                      e.toString()
                                  )
                                }
                              }}
                            >
                              {Object.values(JobUserRole)
                                .filter((m) => m !== "OWNER")
                                .map((m, i) => {
                                  return <option key={i}>{m}</option>
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
                                      companyId: company?.id || 0,
                                      userId: memberToDelete?.user?.id,
                                    })
                                    toast.success(
                                      () => <span>{memberToDelete?.user?.name} removed</span>,
                                      {
                                        id: toastId,
                                      }
                                    )
                                  } catch (error) {
                                    toast.error(
                                      "Sorry, we had an unexpected error. Please try again. - " +
                                        error.toString(),
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
                                className="bg-red-500 rounded-full flex flex-col justify-center items-center"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  setMemberToDelete(m)
                                  setOpenConfirmDelete(true)
                                }}
                              >
                                <XCircleIcon className="w-auto h-6 text-red-100" />
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
      </UserSettingsLayout>
    </AuthLayout>
  )
}

export default UserSettingsMembersPage
