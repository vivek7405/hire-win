import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useRouter,
  useMutation,
  AuthorizationError,
  ErrorComponent,
  getSession,
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
import { XCircleIcon } from "@heroicons/react/outline"

import { MembershipRole } from "db"
import updateMemberRole from "app/jobs/mutations/updateMemberRole"

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
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const job = await invokeWithMiddleware(
          getJob,
          {
            where: { slug: context?.params?.slug as string },
          },
          { ...context }
        )

        return {
          props: {
            user: user,
            job: job,
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

const JobSettingsMembersPage = ({
  user,
  job,
  canUpdate,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [inviteToJobMutation] = useMutation(inviteToJob)
  const [removeFromJobMutation] = useMutation(removeFromJob)
  const [changePermissionMutation] = useMutation(updateMemberRole)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={job!} isOwner={isOwner}>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2
                id="billing-history-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Members
              </h2>
              <Modal header="Invite A User" open={open} setOpen={setOpen}>
                <InvitationForm
                  initialValues={{ email: "" }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                    try {
                      await inviteToJobMutation({
                        jobId: job?.id as string,
                        email: values.email,
                      })
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
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(true)
                }}
                data-testid={`open-inviteUser-modal`}
                className="text-white bg-indigo-600 px-4 py-2 rounded-sm hover:bg-indigo-700"
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
                      Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {job?.memberships.map((m, i) => {
                    return (
                      <tr className="bg-white" key={i}>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                          data-testid={`job-member-${m.user.email}`}
                        >
                          {m.user.email}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                          data-testid={`job-member-${m.user.email}`}
                        >
                          {m.userId === user?.id || m.role === "OWNER" ? (
                            m.role
                          ) : (
                            <select
                              value={m.role}
                              className="border border-gray-300 mt-2 px-2 py-2 block w-full sm:text-sm rounded"
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
                                      role: MembershipRole[e.target.value],
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
                              {Object.values(MembershipRole)
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
                                open={openConfirm}
                                setOpen={setOpenConfirm}
                                header={"Delete Member?"}
                                onSuccess={async () => {
                                  const toastId = toast.loading(() => (
                                    <span>Removing {m.user.email}</span>
                                  ))
                                  try {
                                    await removeFromJobMutation({
                                      jobId: job?.id as string,
                                      userId: m.user.id,
                                    })
                                    toast.success(() => <span>{m.user.email} removed</span>, {
                                      id: toastId,
                                    })
                                  } catch (error) {
                                    toast.error(
                                      "Sorry, we had an unexpected error. Please try again. - " +
                                        error.toString(),
                                      { id: toastId }
                                    )
                                  }
                                  setOpen(false)
                                  router.reload()
                                }}
                              >
                                Are you sure you want to remove this user from the job?
                              </Confirm>

                              <button
                                data-testid={`remove-${m.user.email}-fromJob`}
                                className="bg-red-500 rounded-full"
                                onClick={async (e) => {
                                  e.preventDefault()
                                  setOpenConfirm(true)
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
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsMembersPage
