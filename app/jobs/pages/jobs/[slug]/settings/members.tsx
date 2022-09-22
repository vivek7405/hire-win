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
// import inviteToJob from "app/jobs/mutations/inviteToJob"
import removeFromJob from "app/jobs/mutations/removeFromJob"
import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"
import Modal from "app/core/components/Modal"
import Confirm from "app/core/components/Confirm"
import { ArrowSmDownIcon, ArrowSmRightIcon, XCircleIcon, XIcon } from "@heroicons/react/outline"

import { JobUserRole, User } from "db"
import updateMemberRole from "app/jobs/mutations/updateMemberRole"
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
import { titleCase } from "app/core/utils/titleCase"
import addUserToJob from "app/jobs/mutations/addUserToJob"
import { SubscriptionStatus } from "types"
import { checkSubscription } from "app/companies/utils/checkSubscription"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const company = await invokeWithMiddleware(
    getCompany,
    {
      where: { id: session.companyId || "0" },
    },
    { ...context }
  )

  // const currentPlan = checkPlan(company)

  const { can: canUpdate } = await Guard.can(
    "update",
    "job",
    { session },
    {
      where: {
        companyId_slug: {
          companyId: session.companyId || "0",
          slug: context?.params?.slug as string,
        },
      },
    }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "job",
    { session },
    { where: { slug: context?.params?.slug as string, companyId: session.companyId || "0" } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const job = await invokeWithMiddleware(
          getJob,
          {
            where: { slug: context?.params?.slug as string, companyId: session.companyId || "0" },
          },
          { ...context }
        )

        return {
          props: {
            user,
            job,
            company,
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
  company,
  canUpdate,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openInvite, setOpenInvite] = useState(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false)
  // const [inviteToJobMutation] = useMutation(inviteToJob)
  const [addUserToJobMutation] = useMutation(addUserToJob)
  const [removeFromJobMutation] = useMutation(removeFromJob)
  const [changePermissionMutation] = useMutation(updateMemberRole)
  const [openConfirmBilling, setOpenConfirmBilling] = useState(false)
  const [assignInterviewerToJobStageMutation] = useMutation(assignInterviewerToJobStage)

  const [jobData, setJobData] = useState(job)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={jobData!}>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2
                id="billing-history-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Members
              </h2>
              <Modal
                header="Add User to Job"
                open={openInvite}
                setOpen={setOpenInvite}
                noOverflow={true}
              >
                <InvitationForm
                  header="Add User"
                  subHeader="Add an existing company user to this job"
                  submitText="Add"
                  jobId={job?.id || "0"}
                  isJobInvitation={true}
                  initialValues={{ email: "" }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Inviting {values.email}</span>)
                    try {
                      // await inviteToJobMutation({
                      //   jobId: jobData?.id as string,
                      //   email: values.email,
                      // })
                      await addUserToJobMutation({
                        jobId: jobData?.id as string,
                        email: values.email,
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
                header="Upgrade to the Pro Plan?"
                onSuccess={async () => {
                  router.push(Routes.UserSettingsBillingPage())
                }}
              >
                Upgrade to the Pro Plan to add unlimited users. You cannot add users on the Free
                plan.
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
                data-testid={`open-inviteUser-modal`}
                className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add User
              </button>
            </div>

            <div className="overflow-auto">
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
                  {jobData?.users?.map((m, i) => {
                    return (
                      <tr className="bg-white" key={i}>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200"
                          data-testid={`job-member-${m.user.email}`}
                        >
                          {m.user.name}
                        </td>
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
                                      role: JobUserRole[e.target.value],
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
                              {Object.values(JobUserRole)
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
                                header={"Delete Member?"}
                                onSuccess={async () => {
                                  const toastId = toast.loading(`Removing ${m.user.email}`)
                                  try {
                                    await removeFromJobMutation({
                                      jobId: jobData?.id as string,
                                      userId: m.user.id,
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
                                }}
                              >
                                Are you sure you want to remove this user from the job?
                              </Confirm>

                              <button
                                data-testid={`remove-${m.user.email}-fromJob`}
                                title="Remove User"
                                className="text-red-600 hover:text-red-800"
                                onClick={async (e) => {
                                  e.preventDefault()
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

            <div className="overflow-auto">
              <div className="mt-10 mb-6 w-full">
                <h3 className="font-semibold text-lg flex justify-center whitespace-nowrap">
                  Timings & Interviewers
                </h3>
                <div className="flex flex-col space-y-20 md:flex-row md:space-y-0 lg:flex-row lg:space-y-0 mt-6 items-center md:justify-center lg:justify-center">
                  {jobData?.stages?.map((stage, index) => {
                    // const existingInterviewDetail = stage.interviewDetails?.find(
                    //   (int) => int.stageId === stage.id && int.jobId === jobData.id
                    // )
                    // const existingInterviewer: User | null | undefined = jobData?.users?.find(
                    //   (member) => member?.userId === existingInterviewDetail?.interviewerId
                    // )?.user

                    return (
                      <div
                        key={stage.id}
                        className="bg-white w-32 flex flex-col space-y-2 items-center justify-center p-1"
                      >
                        <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-full flex flex-col items-center justify-center">
                          <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                            {stage?.name}
                          </div>
                        </div>

                        <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />

                        <select
                          className="border border-neutral-300 px-2 py-1 md:py-2 lg:py-2 block w-full sm:text-sm rounded truncate pr-6"
                          name={`timeIntervals.${index}.intervalId`}
                          placeholder={`Time interval for ${stage?.name}`}
                          // disabled={existingInterviewDetail && !existingInterviewer}
                          defaultValue="30"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>

                        <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />

                        <select
                          className="border border-neutral-300 px-2 py-1 md:py-2 lg:py-2 block w-full sm:text-sm rounded truncate pr-6"
                          name={`interviewers.${index}.interviewerId`}
                          placeholder={`Interviewer for ${stage?.name}`}
                          disabled={!stage.interviewerId}
                          defaultValue={
                            stage?.interviewerId?.toString() ||
                            jobData?.users
                              ?.find((member) => member?.role === "OWNER")
                              ?.userId?.toString()
                          }
                          onChange={async (e) => {
                            const selectedInterviewerId = e.target.value
                            const toastId = toast.loading(() => <span>Updating Interviewer</span>)
                            try {
                              const assignedInterviewer = await assignInterviewerToJobStageMutation(
                                {
                                  stageId: stage.id,
                                  interviewerId: selectedInterviewerId || "0",
                                }
                              )
                              if (stage.interviewerId && assignedInterviewer) {
                                stage.interviewerId = assignedInterviewer.interviewerId
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
                          {
                            // !stage.interviewerId ? (
                            jobData?.users?.map((member) => {
                              return (
                                <option
                                  key={member?.userId?.toString()!}
                                  value={member?.userId?.toString()!}
                                >
                                  {member?.user?.name!}
                                </option>
                              )
                            })
                            // ) : (
                            //   <option
                            //     key={(stage.interviewer as User | null | undefined)?.id?.toString()!}
                            //     value={
                            //       (stage.interviewer as User | null | undefined)?.id?.toString()!
                            //     }
                            //   >
                            //     {(stage.interviewer as User | null | undefined)?.name!}
                            //   </option>
                            // )
                          }
                        </select>
                      </div>
                    )
                  })}
                </div>

                {/* <div className="mt-5 w-full flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2 lg:space-y-0 lg:space-x-2">
                  {jobData?.workflow?.stages?.map((ws, index) => {
                      const existingInterviewDetail = ws.interviewDetails?.find(
                        (int) => int.workflowStageId === ws.id && int.jobId === jobData.id
                      )
                      const existingInterviewer: User | null | undefined = jobData?.users?.find(
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
                                jobData?.users
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
                                jobData?.users?.map((member) => {
                                  return (
                                    <option
                                      key={member?.userId?.toString()!}
                                      value={member?.userId?.toString()!}
                                    >
                                      {member?.user?.name!}
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
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsMembersPage
