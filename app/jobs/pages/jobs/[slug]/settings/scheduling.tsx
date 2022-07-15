import React, { Suspense, useState } from "react"
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

const ScheduleCalendarAssignment = ({ job, user, workflowStages, header, noStagesMsg }) => {
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
          // <div className="mt-5 w-full flex flex-col items-center justify-center space-y-2">
          //   <div className="flex">
          //     <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
          //       <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
          //         Stages
          //       </div>
          //     </div>

          //     <div className="w-32 my-2 flex flex-col items-center justify-center">
          //       <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
          //     </div>

          //     <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
          //       <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
          //         Schedules
          //       </div>
          //     </div>

          //     {calendars?.length > 0 && (
          //       <>
          //         <div className="w-32 my-2 flex flex-col items-center justify-center">
          //           <ArrowSmRightIcon className="h-6 w-auto text-neutral-500 invisible" />
          //         </div>

          //         <div className="overflow-auto p-1 w-32 flex flex-col items-center justify-center">
          //           <div className="overflow-hidden text-sm font-bold whitespace-nowrap w-full text-center">
          //             Calendars
          //           </div>
          //         </div>
          //       </>
          //     )}
          //   </div>

          //   {workflowStages?.map((ws, index) => {
          //     const existingScheduleCalendar = ws.jobUserScheduleCalendars?.find(
          //       (int) => int.jobId === job.id && int.userId === user?.id
          //     )
          //     return (
          //       <div key={ws.id} className="flex">
          //         <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
          //           <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
          //             {ws.stage?.name}
          //           </div>
          //         </div>

          //         <div className="w-32 my-2 flex flex-col items-center justify-center">
          //           <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
          //         </div>

          //         <div className="w-32 flex flex-col items-center justify-center">
          //           <select
          //             className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded truncate pr-6"
          //             name={`schedules.${index}.id`}
          //             placeholder={`Select Schedule`}
          //             defaultValue={
          //               existingScheduleCalendar?.scheduleId ||
          //               schedules?.find((schedule) => schedule.name === "Default")?.id
          //             }
          //             onChange={async (e) => {
          //               const selectedScheduleId = e.target.value
          //               const toastId = toast.loading(() => <span>Updating Schedule</span>)
          //               try {
          //                 await assignScheduleToJobStageMutation({
          //                   jobId: job?.id,
          //                   workflowStageId: ws.id,
          //                   scheduleId: parseInt(selectedScheduleId || "0"),
          //                 })
          //                 await invalidateQuery(getJob)

          //                 toast.success(() => <span>Schedule assigned to stage</span>, {
          //                   id: toastId,
          //                 })
          //               } catch (error) {
          //                 toast.error(
          //                   `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
          //                   { id: toastId }
          //                 )
          //               }
          //             }}
          //           >
          //             {schedules?.map((schedule) => {
          //               return (
          //                 <option key={schedule.id} value={schedule.id}>
          //                   {schedule.name}
          //                 </option>
          //               )
          //             })}
          //           </select>
          //         </div>

          //         {calendars?.length > 0 && (
          //           <>
          //             <div className="w-32 my-2 flex flex-col items-center justify-center">
          //               <ArrowSmRightIcon className="h-6 w-auto text-neutral-500" />
          //             </div>

          //             <div className="w-32 flex flex-col items-center justify-center">
          //               <select
          //                 className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded truncate pr-6"
          //                 name={`calendars.${index}.id`}
          //                 placeholder={`Select Calendar`}
          //                 defaultValue={
          //                   existingScheduleCalendar?.calendarId || defaultCalendar?.calendarId
          //                 }
          //                 onChange={async (e) => {
          //                   const selectedCalendarId = e.target.value
          //                   const toastId = toast.loading(() => <span>Updating Calendar</span>)
          //                   try {
          //                     await assignCalendarToJobStageMutation({
          //                       jobId: job?.id,
          //                       workflowStageId: ws.id,
          //                       calendarId: parseInt(selectedCalendarId || "0"),
          //                     })
          //                     await invalidateQuery(getJob)

          //                     toast.success(() => <span>Calendar assigned to stage</span>, {
          //                       id: toastId,
          //                     })
          //                   } catch (error) {
          //                     toast.error(
          //                       `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
          //                       { id: toastId }
          //                     )
          //                   }
          //                 }}
          //               >
          //                 {calendars?.map((cal) => {
          //                   return (
          //                     <option key={cal.id} value={cal.id}>
          //                       {cal.name}
          //                     </option>
          //                   )
          //                 })}
          //               </select>
          //             </div>
          //           </>
          //         )}
          //       </div>
          //     )
          //   })}
          // </div>

          // <div className="w-full flex flex-col md:flex-row lg:flex-row mt-4 items-center md:justify-center lg:justify-center">
          //   {workflowStages?.map((ws, index) => {
          //     const existingScheduleCalendar = ws.jobUserScheduleCalendars?.find(
          //       (int) => int.jobId === job.id && int.userId === user?.id
          //     )

          //     return (
          //       <div
          //         key={ws.id}
          //         className="overflow-auto p-1 m-1 rounded-lg border-2 border-neutral-100 bg-white w-32 flex flex-col space-y-5 py-5 items-center justify-center"
          //       >
          //         <div className="overflow-hidden text-sm text-neutral-600 font-semibold whitespace-nowrap w-full text-center truncate">
          //           {ws.stage?.name}
          //         </div>

          //         <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />

          //         <div className="flex flex-col items-center">
          //           <p className="text-xs text-neutral-500">Schedule</p>
          //           <select
          //             className="mt-1 border border-gray-300 px-2 py-1 block w-full sm:text-sm rounded truncate pr-6"
          //             name={`schedules.${index}.id`}
          //             placeholder={`Select Schedule`}
          //             defaultValue={
          //               existingScheduleCalendar?.scheduleId ||
          //               schedules?.find((schedule) => schedule.name === "Default")?.id
          //             }
          //             onChange={async (e) => {
          //               const selectedScheduleId = e.target.value
          //               const toastId = toast.loading(() => <span>Updating Schedule</span>)
          //               try {
          //                 await assignScheduleToJobStageMutation({
          //                   jobId: job?.id,
          //                   workflowStageId: ws.id,
          //                   scheduleId: parseInt(selectedScheduleId || "0"),
          //                 })
          //                 await invalidateQuery(getJob)

          //                 toast.success(() => <span>Schedule assigned to stage</span>, {
          //                   id: toastId,
          //                 })
          //               } catch (error) {
          //                 toast.error(
          //                   `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
          //                   { id: toastId }
          //                 )
          //               }
          //             }}
          //           >
          //             {schedules?.map((schedule) => {
          //               return (
          //                 <option key={schedule.id} value={schedule.id}>
          //                   {schedule.name}
          //                 </option>
          //               )
          //             })}
          //           </select>
          //         </div>

          //         <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />

          //         {calendars?.length > 0 && (
          //           <div className="flex flex-col items-center">
          //             <p className="text-xs text-neutral-500">Calendar</p>
          //             <select
          //               className="mt-1 border border-gray-300 px-2 py-1 block w-full sm:text-sm rounded truncate pr-6"
          //               name={`calendars.${index}.id`}
          //               placeholder={`Select Calendar`}
          //               defaultValue={
          //                 existingScheduleCalendar?.calendarId || defaultCalendar?.calendarId
          //               }
          //               onChange={async (e) => {
          //                 const selectedCalendarId = e.target.value
          //                 const toastId = toast.loading(() => <span>Updating Calendar</span>)
          //                 try {
          //                   await assignCalendarToJobStageMutation({
          //                     jobId: job?.id,
          //                     workflowStageId: ws.id,
          //                     calendarId: parseInt(selectedCalendarId || "0"),
          //                   })
          //                   await invalidateQuery(getJob)

          //                   toast.success(() => <span>Calendar assigned to stage</span>, {
          //                     id: toastId,
          //                   })
          //                 } catch (error) {
          //                   toast.error(
          //                     `Sorry, we had an unexpected error. Please try again. - ${error.toString()}`,
          //                     { id: toastId }
          //                   )
          //                 }
          //               }}
          //             >
          //               {calendars?.map((cal) => {
          //                 return (
          //                   <option key={cal.id} value={cal.id}>
          //                     {cal.name}
          //                   </option>
          //                 )
          //               })}
          //             </select>
          //           </div>
          //         )}
          //       </div>
          //     )
          //   })}
          // </div>

          <div className="w-full flex flex-col space-y-20 md:space-y-1 lg:space-y-1 mt-6 items-center md:justify-center lg:justify-center">
            {workflowStages?.map((ws, index) => {
              const existingScheduleCalendar = ws.jobUserScheduleCalendars?.find(
                (int) => int.jobId === job.id && int.userId === user?.id
              )

              return (
                <div key={ws.id}>
                  {index === 0 && (
                    <div className="bg-white w-full hidden md:flex lg:flex space-y-2 md:space-y-0 lg:space-y-0 md:space-x-6 lg:space-x-6 items-center justify-center p-1">
                      <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                        <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                          <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate">
                            Stages
                          </div>
                        </div>
                      </div>

                      <ArrowSmRightIcon className="invisible h-6 w-auto text-neutral-500" />

                      <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                        <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                          <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate">
                            Schedules
                          </div>
                        </div>
                      </div>

                      {calendars?.length > 0 && (
                        <>
                          <ArrowSmRightIcon className="invisible h-6 w-auto text-neutral-500" />

                          <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                            <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                              <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate">
                                Calendars
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="bg-white w-full flex flex-col md:flex-row lg:flex-row space-y-2 md:space-y-0 lg:space-y-0 md:space-x-6 lg:space-x-6 items-center justify-center p-1">
                    <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                      <p className="block md:hidden lg:hidden text-xs text-neutral-500">Stage</p>
                      <div className="overflow-auto p-2 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
                        <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                          {ws.stage?.name}
                        </div>
                      </div>
                    </div>

                    <ArrowSmRightIcon className="hidden md:block lg:block h-6 w-auto text-neutral-500" />
                    <ArrowSmDownIcon className="block md:hidden lg:hidden h-6 w-auto text-neutral-500" />

                    <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                      <p className="block md:hidden lg:hidden text-xs text-neutral-500">Schedule</p>
                      <select
                        className="border border-gray-300 px-2 py-2 block w-32 text-sm rounded truncate pr-6"
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
                        <ArrowSmRightIcon className="hidden md:block lg:block h-6 w-auto text-neutral-500" />
                        <ArrowSmDownIcon className="block md:hidden lg:hidden h-6 w-auto text-neutral-500" />
                        <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                          <p className="block md:hidden lg:hidden text-xs text-neutral-500">
                            Calendar
                          </p>
                          <select
                            className="border border-gray-300 px-2 py-2 block w-32 text-sm rounded truncate pr-6"
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
                </div>
              )
            })}
          </div>
        ) : (
          <div>
            <br />
            {noStagesMsg}
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
      <JobSettingsLayout job={job!}>
        <div className="bg-white mt-5 md:mt-0 md:col-span-2">
          <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2
                id="billing-history-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Schedules & Calendars
              </h2>
            </div>

            <Suspense fallback="Loading...">
              <div className="overflow-auto">
                <ScheduleCalendarAssignment
                  job={job}
                  user={user}
                  workflowStages={job?.workflow?.stages?.filter((ws) =>
                    ws.interviewDetails?.some(
                      (int) => int.jobId === job?.id && int.interviewerId === user?.id
                    )
                  )}
                  header="Stages assigned to you"
                  noStagesMsg="There are no stages assigned to you for interview"
                />
              </div>
              <div className="overflow-auto mt-24 md:mt-10 lg:mt-10">
                <ScheduleCalendarAssignment
                  job={job}
                  user={user}
                  workflowStages={job?.workflow?.stages?.filter(
                    (ws) =>
                      !ws.interviewDetails?.some(
                        (int) => int.jobId === job?.id && int.interviewerId === user?.id
                      )
                  )}
                  header="Other Stages"
                  noStagesMsg="No other stages available"
                />
              </div>
            </Suspense>
          </div>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsSchedulingPage
