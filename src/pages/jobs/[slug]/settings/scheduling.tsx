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

import InvitationForm from "src/jobs/components/InvitationForm"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import inviteToJob from "src/jobs/mutations/inviteToJob"
import removeFromJob from "src/jobs/mutations/removeFromJob"
import getJob from "src/jobs/queries/getJob"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import Modal from "src/core/components/Modal"
import Confirm from "src/core/components/Confirm"
import { ArrowSmDownIcon, ArrowSmRightIcon, CogIcon, XCircleIcon } from "@heroicons/react/outline"

import { JobUserRole, User } from "db"
import updateMemberRole from "src/jobs/mutations/updateMemberRole"
import { checkPlan } from "src/companies/utils/checkPlan"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import Form from "src/core/components/Form"
import assignInterviewerToJobStage from "src/jobs/mutations/assignInterviewerToJobStage"
import LabeledInputSelectField from "src/core/components/LabeledInputSelectField"
import getSchedulesWOPagination from "src/schedules/queries/getSchedulesWOPagination"
import getCalendars from "src/calendars/queries/getCalendars"
import getDefaultCalendarByUser from "src/calendars/queries/getDefaultCalendarByUser"
import assignScheduleToJobStage from "src/jobs/mutations/assignScheduleToJobStage"
import assignCalendarToJobStage from "src/jobs/mutations/assignCalendarToJobStage"
import getCompany from "src/companies/queries/getCompany"
import getDefaultScheduleByUser from "src/schedules/queries/getDefaultScheduleByUser"
import { AuthorizationError } from "blitz"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  // const company = await invokeWithMiddleware(
  //   getCompany,
  //   {
  //     where: { id: session.companyId || "0" },
  //   },
  //   { ...context }
  // )

  // const currentPlan = checkPlan(company)

  const { can: canUpdate } = await Guard.can(
    "update",
    "job",
    { ...context.ctx },
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
    { ...context.ctx },
    { where: { slug: context?.params?.slug as string, companyId: session.companyId || "0" } }
  )

  if (user) {
    try {
      // if (canUpdate) {
      const job = await getJob(
        {
          where: { slug: context?.params?.slug as string, companyId: session.companyId || "0" },
        },
        { ...context.ctx }
      )

      return {
        props: {
          user,
          job,
          canUpdate,
          isOwner,
        } as any,
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
        destination: `/auth/login?next=/jobs/${context?.params?.slug}/settings/scheduling`,
        permanent: false,
      },
      props: {},
    }
  }
})

const ScheduleCalendarAssignment = ({ job, user, stages, header, noStagesMsg }) => {
  const [assignScheduleToJobStageMutation] = useMutation(assignScheduleToJobStage)
  const [assignCalendarToJobStageMutation] = useMutation(assignCalendarToJobStage)
  const [schedules] = useQuery(getSchedulesWOPagination, { where: { userId: user?.id } })
  const [calendars] = useQuery(getCalendars, { where: { userId: user?.id } })
  const [defaultCalendar] = useQuery(getDefaultCalendarByUser, null)
  const [defaultSchedule] = useQuery(getDefaultScheduleByUser, null)

  return (
    <>
      <div className="mb-6 flex flex-col justify-center items-center">
        <h3 className="font-semibold text-lg">{header}</h3>
        {(stages?.length || 0) > 0 ? (
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
            {stages?.map((stage, index) => {
              const existingScheduleCalendar = stage.jobUserScheduleCalendars?.find(
                (int) => int.jobId === job.id && int.userId === user?.id
              )

              return (
                <div key={stage.id}>
                  {index === 0 && (
                    <div className="bg-white w-full hidden md:flex lg:flex space-y-2 md:space-y-0 lg:space-y-0 md:space-x-6 lg:space-x-6 items-center justify-center p-1">
                      <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                        <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                          <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate">
                            Stage
                          </div>
                        </div>
                      </div>

                      <ArrowSmRightIcon className="invisible h-6 w-auto text-neutral-500" />

                      <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                        <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                          <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate flex items-center justify-center space-x-2">
                            <div>Availability</div>
                            <Link href={Routes.UserSettingsAvailabilitiesPage()} legacyBehavior>
                              <a className="text-theme-600 hover:text-theme-800">
                                <CogIcon className="w-5 h-5" />
                              </a>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* {calendars?.length > 0 && (
                        <>
                          <ArrowSmRightIcon className="invisible h-6 w-auto text-neutral-500" />

                          <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                            <div className="overflow-auto p-2 rounded-lg w-32 flex flex-col items-center justify-center">
                              <div className="overflow-hidden text-md text-neutral-700 font-semibold whitespace-nowrap w-full text-center truncate flex items-center justify-center space-x-2">
                                <div>Calendar</div>
                                <Link legacyBehavior href={Routes.UserSettingsCalendarsPage()}>
                                  <a className="text-theme-600 hover:text-theme-800">
                                    <CogIcon className="w-5 h-5" />
                                  </a>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </>
                      )} */}
                    </div>
                  )}

                  <div className="bg-white w-full flex flex-col md:flex-row lg:flex-row space-y-2 md:space-y-0 lg:space-y-0 md:space-x-6 lg:space-x-6 items-center justify-center p-1">
                    <div className="flex flex-col space-y-1 md:space-y-0 lg:space-y-0 items-center">
                      <p className="block md:hidden lg:hidden text-xs text-neutral-500">Stage</p>
                      <div className="overflow-auto p-2 rounded-lg border-2 border-neutral-300 bg-white w-32 flex flex-col items-center justify-center">
                        <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                          {stage?.name}
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
                          existingScheduleCalendar?.scheduleId || defaultSchedule?.scheduleId
                        }
                        onChange={async (e) => {
                          const selectedScheduleId = e.target.value
                          const toastId = toast.loading(() => <span>Updating Schedule</span>)
                          try {
                            await assignScheduleToJobStageMutation({
                              stageId: stage.id,
                              scheduleId: selectedScheduleId || "0",
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

                    {/* {calendars?.length > 0 && (
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
                                  stageId: stage.id,
                                  calendarId: selectedCalendarId || "0",
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
                    )} */}
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
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <div className="bg-white mt-5 md:mt-0 md:col-span-2">
            <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Availability for interviews
                  </h2>
                  <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                    Map your availability to stages when you are available for conducting interviews
                  </h4>
                  <h4 className="text-xs sm:text-sm text-gray-700">
                    You may{" "}
                    <Link href={Routes.UserSettingsAvailabilitiesPage()} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-700">
                        add more availabilities
                      </a>
                    </Link>{" "}
                    from User Settings
                  </h4>
                </div>
              </div>

              <Suspense fallback="Loading...">
                <div className="overflow-auto">
                  <ScheduleCalendarAssignment
                    job={job}
                    user={user}
                    stages={job?.stages?.filter((stage) => stage.interviewerId === user?.id)}
                    header="Stages assigned to you"
                    noStagesMsg="There are no stages assigned to you for interview"
                  />
                </div>
                <div className="overflow-auto mt-24 md:mt-10 lg:mt-10">
                  <ScheduleCalendarAssignment
                    job={job}
                    user={user}
                    stages={job?.stages?.filter((stage) => stage.interviewerId !== user?.id)}
                    header="Other Stages"
                    noStagesMsg="No other stages available"
                  />
                </div>
              </Suspense>
            </div>
          </div>
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsSchedulingPage
