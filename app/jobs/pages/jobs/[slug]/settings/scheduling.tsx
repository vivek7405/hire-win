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

import { JobUserRole, User } from "db"
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
import getCompany from "app/companies/queries/getCompany"

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
      where: { id: session.companyId || 0 },
    },
    { ...context }
  )

  const currentPlan = checkPlan(company)

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
      // if (canUpdate) {
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
      // } else {
      //   return {
      //     props: {
      //       error: {
      //         statusCode: 403,
      //         message: "You don't have permission",
      //       },
      //     },
      //   }
      // }
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
        destination: `/login?next=/jobs/${context?.params?.slug}/settings/scheduling`,
        permanent: false,
      },
      props: {},
    }
  }
}

const ScheduleCalendarAssignment = ({ job, user, workflowStages, header }) => {
  const [assignScheduleToJobStageMutation] = useMutation(assignScheduleToJobStage)
  const [assignCalendarToJobStageMutation] = useMutation(assignCalendarToJobStage)
  const [schedules] = useQuery(getSchedulesWOPagination, { where: { ownerId: user?.id } })
  const [calendars] = useQuery(getCalendars, { where: { ownerId: user?.id } })
  const [defaultCalendar] = useQuery(getDefaultCalendarByUser, null)

  return (
    <>
      <div className="mb-6 flex flex-col justify-center items-center">
        <h3 className="font-semibold text-lg">{header}</h3>
        {(workflowStages?.length || 0) > 0 ? (
          <div className="mt-5 w-full flex flex-col items-center justify-center space-y-2">
            <div className="flex">
              <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                  Stages
                </div>
              </div>

              <div className="w-32 my-2 flex flex-col items-center justify-center">
                <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
              </div>

              <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                  Schedules
                </div>
              </div>

              {calendars?.length > 0 && (
                <>
                  <div className="w-32 my-2 flex flex-col items-center justify-center">
                    <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
                  </div>

                  <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                    <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                      Calendars
                    </div>
                  </div>
                </>
              )}
            </div>

            {workflowStages?.map((ws, index) => {
              const existingScheduleCalendar = ws.jobUserScheduleCalendars?.find(
                (int) => int.jobId === job.id && int.userId === user?.id
              )
              return (
                <div key={ws.id} className="flex">
                  <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
                    <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                      {ws.stage?.name}
                    </div>
                  </div>

                  <div className="w-32 my-2 flex flex-col items-center justify-center">
                    <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
                  </div>

                  <div className="w-32 flex flex-col items-center justify-center">
                    <select
                      className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                      name={`schedules.${index}.id`}
                      placeholder={`Select Schedule`}
                      defaultValue={
                        existingScheduleCalendar?.scheduleId ||
                        schedules?.find((schedule) => schedule.name === "Default")?.id
                      }
                      onChange={async (e) => {
                        const selectedScheduleId = e.target.value
                        const toastId = toast.loading(() => <span>Updating Schedule</span>)
                        try {
                          await assignScheduleToJobStageMutation({
                            jobId: job?.id,
                            workflowStageId: ws.id,
                            scheduleId: parseInt(selectedScheduleId || "0"),
                          })
                          await invalidateQuery(getJob)

                          toast.success(() => <span>Schedule assigned to stage</span>, {
                            id: toastId,
                          })
                        } catch (error) {
                          toast.error(
                            `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
                            { id: toastId }
                          )
                        }
                      }}
                    >
                      {schedules?.map((schedule) => {
                        return (
                          <option key={schedule.id} value={schedule.id}>
                            {schedule.name}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  {calendars?.length > 0 && (
                    <>
                      <div className="w-32 my-2 flex flex-col items-center justify-center">
                        <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
                      </div>

                      <div className="w-32 flex flex-col items-center justify-center">
                        <select
                          className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                          name={`calendars.${index}.id`}
                          placeholder={`Select Calendar`}
                          defaultValue={
                            existingScheduleCalendar?.calendarId || defaultCalendar?.calendarId
                          }
                          onChange={async (e) => {
                            const selectedCalendarId = e.target.value
                            const toastId = toast.loading(() => <span>Updating Calendar</span>)
                            try {
                              await assignCalendarToJobStageMutation({
                                jobId: job?.id,
                                workflowStageId: ws.id,
                                calendarId: parseInt(selectedCalendarId || "0"),
                              })
                              await invalidateQuery(getJob)

                              toast.success(() => <span>Calendar assigned to stage</span>, {
                                id: toastId,
                              })
                            } catch (error) {
                              toast.error(
                                `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
                                { id: toastId }
                              )
                            }
                          }}
                        >
                          {calendars?.map((cal) => {
                            return (
                              <option key={cal.id} value={cal.id}>
                                {cal.name}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div>
            <br />
            There are no stages assigned to you for interview
          </div>
        )}
      </div>
    </>
  )
}

const JobSettingsSchedulingPage = ({
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
                Interview Scheduling
              </h2>
            </div>

            <div className="flex flex-col overflow-auto rounded-sm">
              <ScheduleCalendarAssignment
                job={job}
                user={user}
                workflowStages={job?.workflow?.stages?.filter((ws) =>
                  ws.interviewDetails?.some(
                    (int) => int.jobId === job?.id && int.interviewerId === user?.id
                  )
                )}
                header={"Stages assigned to you"}
              />
              <br />
              <ScheduleCalendarAssignment
                job={job}
                user={user}
                workflowStages={job?.workflow?.stages?.filter(
                  (ws) =>
                    !ws.interviewDetails?.some(
                      (int) => int.jobId === job?.id && int.interviewerId === user?.id
                    )
                )}
                header={"Other Stages"}
              />
              {/* <div className="mb-6 flex flex-col justify-center items-center">
                <h3 className="font-semibold text-lg">Stages assigned to you</h3>
                {(jobData?.workflow?.stages?.filter((ws) =>
                  ws.interviewDetails?.some(
                    (int) => int.jobId === job?.id && int.interviewerId === user?.id
                  )
                )?.length || 0) > 0 ? (
                  <div className="mt-5 w-full flex flex-col items-center justify-center space-y-2">
                    <div className="flex">
                      <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                        <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                          Stages
                        </div>
                      </div>

                      <div className="w-32 my-2 flex flex-col items-center justify-center">
                        <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
                      </div>

                      <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                        <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                          Schedules
                        </div>
                      </div>

                      {calendars?.length > 0 && (
                        <>
                          <div className="w-32 my-2 flex flex-col items-center justify-center">
                            <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
                          </div>

                          <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
                            <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
                              Calendars
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {jobData?.workflow?.stages
                      ?.filter((ws) =>
                        ws.interviewDetails?.some(
                          (int) => int.jobId === job?.id && int.interviewerId === user?.id
                        )
                      )
                      .map((ws, index) => {
                        const existingScheduleCalendar = ws.jobUserScheduleCalendars?.find(
                          (int) => int.workflowStageId === ws.id && int.jobId === jobData.id
                        )
                        const existingInterviewer: User | null | undefined = jobData?.users?.find(
                          (member) => member?.userId === existingScheduleCalendar?.userId
                        )?.user

                        const defaultInterviewerId =
                          existingInterviewer?.id?.toString() ||
                          jobData?.users
                            ?.find((member) => member?.role === "OWNER")
                            ?.userId?.toString()

                        return defaultInterviewerId !== user?.id?.toString() ? (
                          <></>
                        ) : (
                          <div key={ws.id} className="flex">
                            <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
                              <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                                {ws.stage?.name}
                              </div>
                            </div>

                            <div className="w-32 my-2 flex flex-col items-center justify-center">
                              <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
                            </div>

                            <div className="w-32 flex flex-col items-center justify-center">
                              <select
                                className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                                name={`schedules.${index}.id`}
                                placeholder={`Select Schedule`}
                                // disabled={existingInterviewDetail && !existingInterviewer}
                                defaultValue={
                                  existingScheduleCalendar?.scheduleId ||
                                  schedules?.find((schedule) => schedule.name === "Default")?.id
                                }
                                onChange={async (e) => {
                                  const selectedScheduleId = e.target.value
                                  const toastId = toast.loading(() => (
                                    <span>Updating Schedule</span>
                                  ))
                                  try {
                                    const assignedSchedule = await assignScheduleToJobStageMutation(
                                      {
                                        jobId: jobData?.id,
                                        workflowStageId: ws.id,
                                        scheduleId: parseInt(selectedScheduleId || "0"),
                                      }
                                    )
                                    if (existingScheduleCalendar && assignedSchedule) {
                                      existingScheduleCalendar.scheduleId =
                                        assignedSchedule.scheduleId
                                      setJobData(jobData)
                                    }

                                    toast.success(() => <span>Schedule assigned to stage</span>, {
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
                                {schedules?.map((schedule) => {
                                  return (
                                    <option key={schedule.id} value={schedule.id}>
                                      {schedule.name}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            {calendars?.length > 0 && (
                              <>
                                <div className="w-32 my-2 flex flex-col items-center justify-center">
                                  <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
                                </div>

                                <div className="w-32 flex flex-col items-center justify-center">
                                  <select
                                    className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
                                    name={`calendars.${index}.id`}
                                    placeholder={`Select Calendar`}
                                    // disabled={existingInterviewDetail && !existingInterviewer}
                                    defaultValue={
                                      existingScheduleCalendar?.calendarId ||
                                      defaultCalendar?.calendarId
                                    }
                                    onChange={async (e) => {
                                      const selectedCalendarId = e.target.value
                                      const toastId = toast.loading(() => (
                                        <span>Updating Calendar</span>
                                      ))
                                      try {
                                        const assignedCalendar =
                                          await assignCalendarToJobStageMutation({
                                            jobId: jobData?.id,
                                            workflowStageId: ws.id,
                                            calendarId: parseInt(selectedCalendarId || "0"),
                                          })
                                        if (existingScheduleCalendar && assignedCalendar) {
                                          existingScheduleCalendar.calendarId =
                                            assignedCalendar.calendarId
                                          setJobData(jobData)
                                        }

                                        toast.success(
                                          () => <span>Calendar assigned to stage</span>,
                                          {
                                            id: toastId,
                                          }
                                        )
                                      } catch (error) {
                                        toast.error(
                                          "Sorry, we had an unexpected error. Please try again. - " +
                                            error.toString()
                                        )
                                      }
                                    }}
                                  >
                                    {calendars?.map((cal) => {
                                      return (
                                        <option key={cal.id} value={cal.id}>
                                          {cal.name}
                                        </option>
                                      )
                                    })}
                                  </select>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div>
                    <br />
                    There are no stages assigned to you for interview
                  </div>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsSchedulingPage
