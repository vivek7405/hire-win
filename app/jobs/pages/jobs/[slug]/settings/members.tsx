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

import { MembershipRole, User } from "db"
import updateMemberRole from "app/jobs/mutations/updateMemberRole"
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

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const currentPlan = checkPlan(user)

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

const JobSettingsMembersPage = ({
  user,
  job,
  canUpdate,
  currentPlan,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openInvite, setOpenInvite] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  const [inviteToJobMutation] = useMutation(inviteToJob)
  const [removeFromJobMutation] = useMutation(removeFromJob)
  const [changePermissionMutation] = useMutation(updateMemberRole)
  const [openConfirmBilling, setOpenConfirmBilling] = useState(false)
  const [assignInterviewerToJobStageMutation] = useMutation(assignInterviewerToJobStage)
  const [assignScheduleToJobStageMutation] = useMutation(assignScheduleToJobStage)
  const [assignCalendarToJobStageMutation] = useMutation(assignCalendarToJobStage)
  const [schedules] = useQuery(getSchedulesWOPagination, { where: { ownerId: user?.id } })
  const [calendars] = useQuery(getCalendars, { where: { ownerId: user?.id } })
  const [defaultCalendar] = useQuery(getDefaultCalendarByUser, null)

  const [jobData, setJobData] = useState(job)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={jobData!} isOwner={isOwner}>
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
                  initialValues={{ email: "" }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                    try {
                      await inviteToJobMutation({
                        jobId: jobData?.id as string,
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
                data-testid={`open-inviteUser-modal`}
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
                      Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobData?.memberships.map((m, i) => {
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
                                open={openConfirmDelete}
                                setOpen={setOpenConfirmDelete}
                                header={"Delete Member?"}
                                onSuccess={async () => {
                                  const toastId = toast.loading(() => (
                                    <span>Removing {m.user.email}</span>
                                  ))
                                  try {
                                    await removeFromJobMutation({
                                      jobId: jobData?.id as string,
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
                                  setOpenInvite(false)
                                  router.reload()
                                }}
                              >
                                Are you sure you want to remove this user from the job?
                              </Confirm>

                              <button
                                data-testid={`remove-${m.user.email}-fromJob`}
                                className="bg-red-500 rounded-full flex flex-col justify-center items-center"
                                onClick={async (e) => {
                                  e.preventDefault()
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

              <div className="mt-10 mb-6 flex flex-col justify-center items-center">
                <h3 className="font-semibold text-lg">Interviewers</h3>
                <div className="mt-5 w-full flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2 lg:space-y-0 lg:space-x-2">
                  {jobData?.workflow?.stages
                    ?.sort((a, b) => {
                      return a.order - b.order
                    })
                    .map((ws, index) => {
                      const existingInterviewDetail = ws.interviewDetails?.find(
                        (int) => int.workflowStageId === ws.id && int.jobId === jobData.id
                      )
                      const existingInterviewer: User | null | undefined =
                        jobData?.memberships?.find(
                          (member) => member?.userId === existingInterviewDetail?.interviewerId
                        )?.user

                      return (
                        <div key={ws.id}>
                          <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
                            <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                              {ws.stage?.name}
                            </div>
                          </div>

                          <div className="w-32 my-2 flex flex-col items-center justify-center">
                            <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />
                          </div>

                          <div className="w-32 flex flex-col items-center justify-center">
                            <select
                              className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                              name={`timeIntervals.${index}.intervalId`}
                              placeholder={`Time interval for ${ws.stage?.name}`}
                              // disabled={existingInterviewDetail && !existingInterviewer}
                              defaultValue="30"
                            >
                              <option value="15">15 minutes</option>
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">60 minutes</option>
                            </select>
                          </div>

                          <div className="w-32 my-2 flex flex-col items-center justify-center">
                            <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />
                          </div>

                          <div className="w-32 flex flex-col items-center justify-center">
                            <select
                              className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                              name={`interviewers.${index}.interviewerId`}
                              placeholder={`Interviewer for ${ws.stage?.name}`}
                              disabled={existingInterviewDetail && !existingInterviewer}
                              defaultValue={
                                existingInterviewDetail?.interviewerId?.toString() ||
                                jobData?.memberships
                                  ?.find((member) => member?.role === "OWNER")
                                  ?.userId?.toString()
                              }
                              onChange={async (e) => {
                                const selectedInterviewerId = e.target.value
                                const toastId = toast.loading(() => (
                                  <span>Updating Interviewer</span>
                                ))
                                try {
                                  const assignedInterviewer =
                                    await assignInterviewerToJobStageMutation({
                                      jobId: jobData?.id,
                                      workflowStageId: ws.id,
                                      interviewerId: parseInt(selectedInterviewerId || "0"),
                                    })
                                  if (existingInterviewDetail && assignedInterviewer) {
                                    existingInterviewDetail.interviewerId =
                                      assignedInterviewer.interviewerId
                                    setJobData(jobData)
                                  }

                                  toast.success(() => <span>Interviewer assigned to stage</span>, {
                                    id: toastId,
                                  })
                                } catch (error) {
                                  toast.error(
                                    "Sorry, we had an unexpected error. Please try again. - " +
                                      error.toString()
                                  )
                                }
                              }}
                            >
                              {!existingInterviewDetail || existingInterviewer ? (
                                jobData?.memberships?.map((member) => {
                                  return (
                                    <option
                                      key={member?.userId?.toString()!}
                                      value={member?.userId?.toString()!}
                                    >
                                      {member?.user?.email!}
                                    </option>
                                  )
                                })
                              ) : (
                                <option
                                  key={
                                    (
                                      existingInterviewer as User | null | undefined
                                    )?.id?.toString()!
                                  }
                                  value={
                                    (
                                      existingInterviewer as User | null | undefined
                                    )?.id?.toString()!
                                  }
                                >
                                  {(existingInterviewer as User | null | undefined)?.email!}
                                </option>
                              )}
                            </select>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsMembersPage
