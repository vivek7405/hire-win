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

import JobInvitationForm from "src/jobs/components/JobInvitationForm"
import Breadcrumbs from "src/core/components/Breadcrumbs"
// import inviteToJob from "src/jobs/mutations/inviteToJob"
import removeFromJob from "src/jobs/mutations/removeFromJob"
import getJob from "src/jobs/queries/getJob"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import Modal from "src/core/components/Modal"
import Confirm from "src/core/components/Confirm"
import { ArrowSmDownIcon, ArrowSmRightIcon, XCircleIcon, XIcon } from "@heroicons/react/outline"

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
import { titleCase } from "src/core/utils/titleCase"
import addUserToJob from "src/jobs/mutations/addUserToJob"
import { PlanName, SubscriptionStatus } from "types"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import assignInterviewDurationToJobStage from "src/jobs/mutations/assignInterviewDurationToJobStage"
import { AuthorizationError } from "blitz"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import UpgradeMessage from "src/plans/components/UpgradeMessage"

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
      if (canUpdate) {
        const job = await getJob(
          {
            where: {
              slug: (context?.params?.slug as string) || "0",
              companyId: session.companyId || "0",
            },
          },
          { ...context.ctx }
        )

        const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

        return {
          props: {
            user,
            job,
            company,
            canUpdate,
            isOwner,
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
        destination: `/auth/login?next=/jobs/${context?.params?.slug}/settings/members`,
        permanent: false,
      },
      props: {},
    }
  }
})

const JobSettingsHiringTeamPage = ({
  user,
  job,
  company,
  canUpdate,
  isOwner,
  activePlanName,
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
  const [assignInterviewDurationToJobStageMutation] = useMutation(assignInterviewDurationToJobStage)

  const [jobData, setJobData] = useState(job)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  const [openUpgradeConfirm, setOpenUpgradeConfirm] = React.useState(false)
  const [upgradeConfirmHeader, setUpgradeConfirmHeader] = useState("Upgrade to recruiter plan")
  const [upgradeConfirmMessage, setUpgradeConfirmMessage] = useState(
    "Upgrade to recruiter plan for adding more members."
  )

  return (
    <AuthLayout title="Hire.win | Hiring Team" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={jobData!}>
          <div className="bg-white mt-5 md:mt-0 md:col-span-2">
            <div className="px-4 py-5 md:p-6 md:flex md:flex-col">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Hiring Team</h2>
                  <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                    Add existing company users to the Hiring Team for this job
                  </h4>
                  <h4 className="text-xs sm:text-sm text-gray-700">
                    You may{" "}
                    <Link href={Routes.UserSettingsMembersPage()} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-700">
                        invite more company users
                      </a>
                    </Link>{" "}
                    from Members Settings
                  </h4>
                  {activePlanName === PlanName.FREE && (
                    <div className="mt-2">
                      <UpgradeMessage message="Upgrade to add more members" />
                    </div>
                  )}
                </div>
                <Modal
                  header="Add Member to Job"
                  open={openInvite}
                  setOpen={setOpenInvite}
                  noOverflow={true}
                >
                  <JobInvitationForm
                    header="Add Team Member"
                    subHeader="Add an existing company user to this job"
                    submitText="Add"
                    jobId={job?.id || "0"}
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
                          jobUserRole: values.jobUserRole,
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
                  Upgrade to the Recruiter Plan to add unlimited users. You cannot add users on the
                  Free plan.
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

                <button
                  onClick={(e) => {
                    e.preventDefault()

                    if (activePlanName === PlanName.FREE) {
                      setUpgradeConfirmHeader("Upgrade to recruiter plan")
                      setUpgradeConfirmMessage("Upgrade to recruiter plan for adding more members.")
                      setOpenInvite(false)
                      setOpenUpgradeConfirm(true)
                      return
                    }
                    // else if (activePlanName === PlanName.LIFETIME_SET1) {
                    //   if (jobData?.users?.length >= LIFETIME_SET1_MEMBERS_LIMIT) {
                    //     setUpgradeConfirmHeader("Members limit reached")
                    //     setUpgradeConfirmMessage(
                    //       `The lifetime plan allows upto ${LIFETIME_SET1_MEMBERS_LIMIT} users to collaborate. Since this job already has ${LIFETIME_SET1_MEMBERS_LIMIT} members added, you can't add a new member.`
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
                  <h3 className="font-semibold text-lg flex justify-center">
                    Interview Duration & Evaluators (Interviewers)
                  </h3>
                  <p className="text-sm text-neutral-600 text-center">
                    These evaluators shall be assigned to candidate by default when moved to that
                    particular stage. You can always change the evaluator for a particular candidate
                    stage from the candidate details page.
                  </p>
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
                          <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-white w-full flex flex-col items-center justify-center">
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
                            defaultValue={stage?.duration?.toString() || "30"}
                            onChange={async (e) => {
                              const selectedInterviewDuration = parseInt(e.target.value || "0")
                              const toastId = toast.loading(() => <span>Updating Interviewer</span>)
                              try {
                                const updatedStage =
                                  await assignInterviewDurationToJobStageMutation({
                                    stageId: stage.id,
                                    interviewDuration: selectedInterviewDuration || 0,
                                  })
                                if (stage.interviewerId && updatedStage) {
                                  stage.duration = updatedStage.duration
                                  setJobData(jobData)
                                }

                                toast.success(
                                  () => <span>Interview duration updated for stage</span>,
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
                              const toastId = toast.loading(() => <span>Updating Evaluator</span>)
                              try {
                                const updatedStage = await assignInterviewerToJobStageMutation({
                                  stageId: stage.id,
                                  interviewerId: selectedInterviewerId || "0",
                                })
                                if (stage.interviewerId && updatedStage) {
                                  stage.interviewerId = updatedStage.interviewerId
                                  setJobData(jobData)
                                }

                                toast.success(() => <span>Evaluator assigned to stage</span>, {
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
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsHiringTeamPage
