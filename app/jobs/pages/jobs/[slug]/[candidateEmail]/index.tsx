import React, { Suspense, useEffect, useMemo, useState } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useRouter,
  useMutation,
  useQuery,
  invalidateQuery,
  useSession,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import getCandidate from "app/candidates/queries/getCandidate"
import { AttachmentObject, CardType, ExtendedCandidate, ExtendedScoreCard } from "types"
import axios from "axios"
import PDFViewer from "app/core/components/PDFViewer"
import { JobUserRole } from "@prisma/client"
import ScoreCard from "app/score-cards/components/ScoreCard"
import toast from "react-hot-toast"
import Form from "app/core/components/Form"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import updateCandidateScores from "app/candidates/mutations/updateCandidateScores"
import linkScoreCardWithJobWorkflowStage from "app/jobs/mutations/linkScoreCardWithJobWorkflowStage"
import Modal from "app/core/components/Modal"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import getCandidateInterviewsByStage from "app/scheduling/interviews/queries/getCandidateInterviewsByStage"
import {
  ArrowRightIcon,
  BanIcon,
  ChevronDownIcon,
  PencilAltIcon,
  RefreshIcon,
} from "@heroicons/react/outline"
import Confirm from "app/core/components/Confirm"
import Interviews from "app/scheduling/interviews/components/Interviews"
import Comments from "app/comments/components/Comments"
import Emails from "app/emails/components/Emails"
import getCandidatePoolsWOPagination from "app/candidate-pools/queries/getCandidatePoolsWOPagination"
import addCandidateToPool from "app/candidate-pools/mutations/addCandidateToPool"
import getScoreAverage from "app/score-cards/utils/getScoreAverage"
import setCandidateRejected from "app/candidates/mutations/setCandidateRejected"
import updateCandidateStage from "app/candidates/mutations/updateCandidateStage"
import getCandidateInterviewDetail from "app/candidates/queries/getCandidateInterviewDetail"
import ApplicationForm from "app/candidates/components/ApplicationForm"
import getCandidateInitialValues from "app/candidates/utils/getCandidateInitialValues"
import updateCandidate from "app/candidates/mutations/updateCandidate"
import Card from "app/core/components/Card"
import getJob from "app/jobs/queries/getJob"
import getCandidateAnswerForDisplay from "app/candidates/utils/getCandidateAnswerForDisplay"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const job = await invokeWithMiddleware(
    getJob,
    {
      where: {
        companyId: session.companyId || "0",
        slug: context?.params?.slug as string,
      },
    },
    { ...context }
  )

  const { can: canUpdate } = await Guard.can(
    "update",
    "candidate",
    { session },
    {
      where: {
        jobId_email: {
          jobId: job?.id,
          email: context?.params?.candidateEmail as string,
        },
      },
    }
  )

  if (user) {
    try {
      const candidate = await invokeWithMiddleware(
        getCandidate,
        {
          where: { email: context?.params?.candidateEmail as string, jobId: job?.id },
        },
        { ...context }
      )

      if (candidate) {
        return {
          props: {
            user: user,
            canUpdate: canUpdate,
            candidateEmail: candidate?.email as string,
            jobId: candidate?.jobId,
            // candidate: candidate,
          },
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 404,
              message: "Candidate not found",
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
        destination: `/login?next=jobs/${context?.params?.slug}/candidates/${context?.params?.candidateEmail}`,
        permanent: false,
      },
      props: {},
    }
  }
}

// const parseResume = async (resume) => {
//   if (resume) {
//     const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/resume/parse`
//     const config = {
//       headers: {
//         "content-type": "application/json",
//       },
//     }
//     await axios
//       .post(url, resume, config)
//       .then((response) => {
//         console.log(response?.data)
//       })
//       .catch((error) => {
//         console.log(error)
//       })
//   }
// }

const getResume = async (Key) => {
  if (Key) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/getFile`
    const config = {
      headers: {
        "content-type": "application/json",
      },
    }
    const response = await axios.post(url, { Key }, config)
    return response
  } else {
    return null
  }
}

const getCards = (candidate: ExtendedCandidate) => {
  return (
    candidate?.job?.form?.questions
      // ?.filter((q) => !q.question.factory)
      ?.map((fq) => {
        const answer = getCandidateAnswerForDisplay(fq, candidate)
        return {
          id: fq.id,
          title: fq.question.name,
          description: answer,
          // renderContent: (
          //   <>
          //     <div className="w-full flex flex-col space-y-2">
          //       <div className="w-full relative">
          //         <div className="font-semibold flex justify-between">
          //           {!fq.question.factory ? (
          //             <Link href={Routes.SingleQuestionPage({ slug: fq.question.slug })} passHref>
          //               <a
          //                 data-testid={`questionlink`}
          //                 className="text-theme-600 hover:text-theme-900"
          //               >
          //                 {fq.question.name}
          //               </a>
          //             </Link>
          //           ) : (
          //             fq.question.name
          //           )}
          //         </div>
          //       </div>

          //       {/* <div className="border-b-2 border-neutral-50" />
          //       <div className="text-sm text-neutral-500 font-semibold">
          //         {fq.question?.type?.toString().replaceAll("_", " ")}
          //       </div> */}

          //       {answer && <div className="border-b-2 border-neutral-50" />}
          //       {answer && (
          //         <div className="text-lg font-bold">
          //           {answer}
          //         </div>
          //       )}
          //     </div>
          //   </>
          // ),
        }
      }) as CardType[]
  )
}

// const getScoreCardJobWorkflowStage = (candidate, selectedWorkflowStageId) => {
//   return candidate?.job?.scoreCards?.find(
//     (sc) => sc.workflowStageId === selectedWorkflowStageId || candidate?.workflowStageId
//   )
// }

const SingleCandidatePage = ({
  user,
  error,
  canUpdate,
  candidateEmail,
  jobId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/candidates", breadcrumb: "Candidates" }]} />
      <br />
      <Suspense fallback="Loading...">
        <SingleCandidatePageContent
          user={user as any}
          error={error as any}
          canUpdate={canUpdate as any}
          candidateEmail={candidateEmail as any}
          jobId={jobId}
        />
      </Suspense>
    </AuthLayout>
  )
}

const SingleCandidatePageContent = ({
  user,
  error,
  canUpdate,
  candidateEmail,
  jobId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  enum CandidateToggleView {
    Scores = "Scores",
    Interviews = "Interviews",
    Comments = "Comments",
    Emails = "Emails",
  }

  // const { user, error, canUpdate } = props
  // const [candidate, setCandidate] = useState(props.candidate)
  const [candidate] = useQuery(getCandidate, { where: { email: candidateEmail, jobId } })
  const [candidateToggleView, setCandidateToggleView] = useState(CandidateToggleView.Scores)
  const [selectedWorkflowStage, setSelectedWorkflowStage] = useState(candidate?.workflowStage)
  // const scoreCardId = candidate?.job?.scoreCards?.find(sc => sc.workflowStageId === selectedWorkflowStage?.id)?.scoreCardId || ""
  const [scoreCardId, setScoreCardId] = useState(
    candidate?.job?.scoreCards?.find((sc) => sc.workflowStageId === selectedWorkflowStage?.id)
      ?.scoreCardId || ""
  )
  useEffect(() => {
    setScoreCardId(
      candidate?.job?.scoreCards?.find((sc) => sc.workflowStageId === selectedWorkflowStage?.id)
        ?.scoreCardId || ""
    )
  }, [candidate, selectedWorkflowStage])

  useEffect(() => {
    setSelectedWorkflowStage(candidate?.workflowStage)
  }, [candidate?.workflowStage])

  const [file, setFile] = useState(null as any)
  // const [cards, setCards] = useState(getCards(candidate!))
  // useEffect(() => {
  //   setCards(getCards(candidate!))
  // }, [candidate])

  const router = useRouter()
  const session = useSession()
  const [updateCandidateScoresMutation] = useMutation(updateCandidateScores)
  const [linkScoreCardWithJobWorkflowStageMutation] = useMutation(linkScoreCardWithJobWorkflowStage)
  const [candidatePools] = useQuery(getCandidatePoolsWOPagination, {
    where: { companyId: session.companyId || "0", candidates: { none: { id: candidate?.id } } },
  })
  const [addCandidateToPoolMutation] = useMutation(addCandidateToPool)

  const [candidatePoolsOpenMobile, setCandidatePoolsOpenMobile] = useState(false)
  const [candidatePoolsOpenTablet, setCandidatePoolsOpenTablet] = useState(false)
  const [candidatePoolsOpenDesktop, setCandidatePoolsOpenDesktop] = useState(false)

  const [stagesOpenMobile, setStagesOpenMobile] = useState(false)
  const [stagesOpenTablet, setStagesOpenTablet] = useState(false)
  const [stagesOpenDesktop, setStagesOpenDesktop] = useState(false)

  const resume = candidate?.resume as AttachmentObject
  useMemo(() => {
    if (resume?.Key) {
      getResume(resume?.Key).then((response) => {
        const file = response?.data?.Body
        setFile(file)
      })
    }
  }, [resume.Key])

  const [candidateToReject, setCandidateToReject] = useState(null as any)
  const [openCandidateRejectConfirm, setOpenCandidateRejectConfirm] = useState(false)
  const [setCandidateRejectedMutation] = useMutation(setCandidateRejected)

  const [openCandidateMoveConfirm, setOpenCandidateMoveConfirm] = useState(false)
  const [candidateToMove, setCandidateToMove] = useState(null as any)
  const [moveToWorkflowStage, setMoveToWorkflowStage] = useState(null as any)
  const [openEditModal, setOpenEditModal] = useState(false)

  const [updateCandidateStageMutation] = useMutation(updateCandidateStage)
  const [updateCandidateMutation] = useMutation(updateCandidate)

  // const [candidateWorkflowStageInterviewer] = useQuery(getCandidateWorkflowStageInterviewer, {
  //   where: { candidateId: candidate.id, workflowStageId: selectedWorkflowStage?.id },
  // })

  // const getExistingCandidateInterviewer = useCallback(() => {
  //   const existingInterviewDetail = selectedWorkflowStage?.interviewDetails?.find(
  //     (int) => int.workflowStageId === selectedWorkflowStage?.id && int.jobId === candidate?.jobId
  //   )
  //   const existingJobInterviewer: User | null | undefined = jobData?.users?.find(
  //     (member) => member?.userId === existingInterviewDetail?.interviewerId
  //   )?.user

  //   return (
  //     candidateWorkflowStageInterviewer?.interviewer?.id?.toString() ||
  //     existingJobInterviewer?.id?.toString() ||
  //     jobData?.users?.find((member) => member?.role === "OWNER")?.userId?.toString()
  //   )
  // }, [
  //   candidate?.jobId,
  //   candidateWorkflowStageInterviewer?.interviewer?.id,
  //   jobData?.users,
  //   selectedWorkflowStage?.id,
  //   selectedWorkflowStage?.interviewDetails,
  // ])

  const [interviewDetail] = useQuery(getCandidateInterviewDetail, {
    workflowStageId: candidate?.workflowStageId!, // selectedWorkflowStage?.id!,
    candidateId: candidate?.id,
    jobId: candidate?.jobId,
  })

  // let ratingsArray = [] as number[]
  // candidate?.scores?.forEach((score) => {
  //   ratingsArray.push(score.rating)
  // })

  // const [openScheduleInterviewModal, setOpenScheduleInterviewModal] = useState(false)
  // const [cancelInterviewMutation] = useMutation(cancelInterview)
  // const [interviewToDelete, setInterviewToDelete] = useState(null as any as Interview)
  // const [openConfirm, setOpenConfirm] = useState(false)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  // try {
  //   parseResume(resume)
  // } catch (error) {
  //   console.log(error)
  // }

  const updateCandidateStg = async (candidate, selectedWorkflowStageId) => {
    const selectedStageName =
      candidate?.job?.workflow?.stages?.find((ws) => ws.id === selectedWorkflowStageId)?.stage
        ?.name || ""

    const toastId = toast.loading(() => (
      <span>
        <b>Setting stage as {selectedStageName}</b>
        <br />
        for candidate - {candidate?.name}
      </span>
    ))

    try {
      await updateCandidateStageMutation({
        where: { id: candidate?.id },
        data: { workflowStageId: selectedWorkflowStageId },
      })
      invalidateQuery(getCandidate)
      toast.success(
        () => (
          <span>
            <b>Stage changed successfully</b>
            <br />
            for candidate - {candidate?.name}
          </span>
        ),
        { id: toastId }
      )
    } catch (error) {
      toast.error("Sorry, we had an unexpected error. Please try again. - " + error.toString(), {
        id: toastId,
      })
    }
  }

  const candidateNameHeader = (
    <h3
      className={`font-bold text-5xl ${
        candidate?.rejected ? "text-red-600" : "text-theme-600"
      } capitalize`}
    >
      {/* Used regular expression for getting the first word */}
      {candidate?.name?.replace(/ .*/, "")?.length > 10
        ? `${candidate?.name?.replace(/ .*/, "")?.substring(0, 10)}...`
        : candidate?.name?.replace(/ .*/, "")}
    </h3>
  )

  const candidateRatingDiv = (
    <Form
      noFormatting={true}
      onSubmit={async () => {
        return
      }}
    >
      <LabeledRatingField
        name="candidateAverageRating"
        ratingClass={`!flex items-center`}
        height={8}
        color={candidate?.rejected ? "red" : "theme"}
        value={Math.round(getScoreAverage(candidate?.scores?.map((score) => score.rating) || []))}
        disabled={true}
      />
    </Form>
  )

  const candidateStageAndInterviewerDiv = (
    <div className="px-3 py-1 rounded-lg border-2 border-theme-600 text-theme-700 font-semibold flex items-center justify-center space-x-2">
      <span>{candidate?.workflowStage?.stage?.name}</span>
      <ArrowRightIcon className="w-4 h-4" />
      <span>{interviewDetail?.interviewer?.name}</span>
    </div>
  )

  const rejectCandidateButton = (
    <button
      title={candidate?.rejected ? "Restore Candidate" : "Reject Candidate"}
      className="cursor-pointer float-right underline text-red-600 py-2 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={
        // interviewDetail?.interviewer?.id !== user?.id &&
        user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
          JobUserRole.OWNER &&
        user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
          JobUserRole.ADMIN
      }
      onClick={(e) => {
        e.preventDefault()
        setCandidateToReject(candidate)
        setOpenCandidateRejectConfirm(true)
      }}
    >
      {candidate?.rejected ? <RefreshIcon className="w-6 h-6" /> : <BanIcon className="w-6 h-6" />}
    </button>
  )

  const updateCandidateDetailsButton = (
    <button
      title="Update Candidate Details"
      className="float-right underline text-theme-600 py-2 hover:text-theme-800 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={
        user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
          JobUserRole.OWNER &&
        user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
          JobUserRole.ADMIN
      }
      data-testid={`${candidate?.id}-settingsLink`}
      onClick={(e) => {
        e.preventDefault()
        setOpenEditModal(true)
      }}
    >
      <PencilAltIcon className="h-6 w-6" />
    </button>
  )

  const MoveToNextStageButton = ({ stagesOpen, setStagesOpen }) => {
    return (
      <div className="cursor-pointer flex justify-center">
        <button
          className="text-white bg-theme-600 px-3 py-2 hover:bg-theme-700 rounded-l-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          disabled={
            // interviewDetail?.interviewer?.id !== user?.id &&
            user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
              JobUserRole.OWNER &&
            user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
              JobUserRole.ADMIN
          }
          onClick={async (e) => {
            e.preventDefault()

            if (
              (candidate?.workflowStage?.order || 0) ===
              (candidate?.job?.workflow?.stages?.length || 0)
            ) {
              toast.error("The candidate is already in the last stage")
              return
            } else {
              setCandidateToMove(candidate)
              setMoveToWorkflowStage(null)
              setOpenCandidateMoveConfirm(true)
            }
          }}
        >
          Move to Next Stage
        </button>
        <DropdownMenu.Root modal={false} open={stagesOpen} onOpenChange={setStagesOpen}>
          <DropdownMenu.Trigger
            className="float-right disabled:opacity-50 disabled:cursor-not-allowed text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center focus:outline-none"
            disabled={
              // interviewDetail?.interviewer?.id !== user?.id &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                JobUserRole.OWNER &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                JobUserRole.ADMIN
            }
          >
            <button
              className="flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                // interviewDetail?.interviewer?.id !== user?.id &&
                user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                  JobUserRole.OWNER &&
                user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                  JobUserRole.ADMIN
              }
            >
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
            <DropdownMenu.Arrow className="fill-current" offset={10} />
            {candidate?.job?.workflow?.stages?.length === 0 && (
              <DropdownMenu.Item
                disabled={true}
                onSelect={(e) => {
                  e.preventDefault()
                }}
                className="opacity-50 cursor-not-allowed text-left w-full whitespace-nowrap block px-4 py-2 text-sm text-gray-700 focus:outline-none focus-visible:text-gray-500"
              >
                No stages
              </DropdownMenu.Item>
            )}
            {candidate?.job?.workflow?.stages.map((ws) => {
              return (
                <DropdownMenu.Item
                  key={ws.id}
                  onSelect={async (e) => {
                    e.preventDefault()

                    if (candidate?.workflowStage?.id === ws?.id) {
                      toast.error(`The candidate is already in the ${ws?.stage?.name} stage`)
                    } else {
                      setCandidateToMove(candidate)
                      setMoveToWorkflowStage(ws)
                      setOpenCandidateMoveConfirm(true)
                    }
                  }}
                  className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                >
                  {ws.stage?.name?.length > 30
                    ? `${ws.stage?.name?.substring(0, 30)}...`
                    : ws.stage?.name}
                </DropdownMenu.Item>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    )
  }

  const AddToPoolButton = ({ candidatePoolsOpen, setCandidatePoolsOpen }) => {
    return (
      <DropdownMenu.Root
        modal={false}
        open={candidatePoolsOpen}
        onOpenChange={setCandidatePoolsOpen}
      >
        <DropdownMenu.Trigger
          className="float-right disabled:opacity-50 disabled:cursor-not-allowed text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center focus:outline-none"
          disabled={
            user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
              JobUserRole.OWNER &&
            user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
              JobUserRole.ADMIN
          }
        >
          <button
            className="flex px-2 py-1 justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            disabled={
              // selectedWorkflowStage?.interviewDetails?.find(
              //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
              // )?.interviewerId !== user?.id &&
              // interviewDetail?.interviewer?.id !== user?.id &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                JobUserRole.OWNER &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !==
                JobUserRole.ADMIN
            }
          >
            Add to <ChevronDownIcon className="w-5 h-5 ml-1" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
          <DropdownMenu.Arrow className="fill-current" offset={10} />
          {candidatePools?.length === 0 && (
            <DropdownMenu.Item
              disabled={true}
              onSelect={(e) => {
                e.preventDefault()
              }}
              className="opacity-50 cursor-not-allowed text-left w-full whitespace-nowrap block px-4 py-2 text-sm text-gray-700 focus:outline-none focus-visible:text-gray-500"
            >
              No more pools to add
            </DropdownMenu.Item>
          )}
          {candidatePools.map((cp) => {
            return (
              <DropdownMenu.Item
                key={cp.id}
                onSelect={async (e) => {
                  e.preventDefault()
                  const toastId = toast.loading(`Adding candidate to pool - ${cp.name}`)
                  try {
                    await addCandidateToPoolMutation({ candidateId: candidate?.id, poolId: cp.id })
                    await invalidateQuery(getCandidatePoolsWOPagination)
                    toast.success(`Candidate added to pool - ${cp.name}`, { id: toastId })
                  } catch (error) {
                    toast.error(`Failed adding candidate to pool - ${error.toString()}`, {
                      id: toastId,
                    })
                  }
                  setCandidatePoolsOpen(false)
                }}
                className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
              >
                {cp.name?.length > 30 ? `${cp.name?.substring(0, 30)}...` : cp.name}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    )
  }

  return (
    <>
      <Modal header="Update Candidate" open={openEditModal} setOpen={setOpenEditModal}>
        <ApplicationForm
          header="Update Candidate"
          subHeader=""
          formId={candidate?.job?.formId || ""}
          preview={false}
          initialValues={getCandidateInitialValues(candidate)}
          onSubmit={async (values) => {
            const toastId = toast.loading(`Updating Candidate`)
            try {
              const updatedCandidate = await updateCandidateMutation({
                where: { id: candidate?.id },
                initial: candidate as any,
                data: {
                  id: candidate?.id,
                  jobId: candidate?.job?.id,
                  name: values.Name,
                  email: values.Email,
                  resume: values.Resume,
                  source: candidate?.source,
                  answers:
                    (candidate?.job?.form?.questions?.map((fq) => {
                      const val = values[fq.question?.name] || ""
                      return {
                        questionId: fq.questionId,
                        value: typeof val === "string" ? val : JSON.stringify(val),
                      }
                    }) as any) || ([] as any),
                },
              })
              toast.success(`Candidate updated`, { id: toastId })
              if (updatedCandidate?.email === candidate?.email) {
                await invalidateQuery(getCandidate)
                setOpenEditModal(false)
              } else {
                setOpenEditModal(false)
                router.replace(
                  Routes.SingleCandidatePage({
                    slug: candidate?.job?.slug,
                    candidateEmail: updatedCandidate?.email,
                  })
                )
              }
            } catch (error) {
              toast.error("Something went wrong - " + error.toString(), { id: toastId })
              setOpenEditModal(false)
            }
          }}
        />
      </Modal>

      <Confirm
        open={openCandidateRejectConfirm}
        setOpen={setOpenCandidateRejectConfirm}
        header={`${candidateToReject?.rejected ? "Restore" : "Reject"} Candidate - ${
          candidateToReject?.name
        }`}
        onSuccess={async () => {
          const toastId = toast.loading(
            `${candidateToReject?.rejected ? "Restoring" : "Rejecting"} Candidate`
          )
          try {
            await setCandidateRejectedMutation({
              where: { id: candidateToReject?.id },
              rejected: !candidateToReject?.rejected,
            })
            setOpenCandidateRejectConfirm(false)
            setCandidateToReject(null as any)
            if (candidate) {
              // setCandidate({
              //   ...candidate,
              //   rejected: !candidateToReject?.rejected,
              //   resume: candidate?.resume!,
              // })
              invalidateQuery(getCandidate)
            }
            toast.success(`Candidate ${candidateToReject?.rejected ? "Restored" : "Rejected"}`, {
              id: toastId,
            })
          } catch (error) {
            toast.error(
              `${
                candidateToReject?.rejected ? "Restoring" : "Rejecting"
              } candidate failed - ${error.toString()}`,
              { id: toastId }
            )
          }
        }}
      >
        Are you sure you want to {candidateToReject?.rejected ? "Restore" : "Reject"} the candidate?
      </Confirm>

      <Confirm
        open={openCandidateMoveConfirm}
        setOpen={setOpenCandidateMoveConfirm}
        header={`Move Candidate - ${candidateToMove?.name} - to ${
          moveToWorkflowStage ? moveToWorkflowStage.stage?.name : "next"
        } stage`}
        onSuccess={async () => {
          // const toastId = toast.loading(
          //   `Moving candidate to ${
          //     moveToWorkflowStage ? moveToWorkflowStage.stage?.name : "next"
          //   } stage`
          // )
          try {
            // await moveCandidateMutation({
            //   where: { id: candidateToMove?.id },
            //   rejected: !candidateToMove?.rejected,
            // })

            const workflowStages = candidate?.job?.workflow?.stages
            const currentStageOrder =
              workflowStages?.find((ws) => ws.id === candidateToMove.workflowStageId)?.order || 0
            const nextStage = workflowStages?.find((ws) => ws.order === currentStageOrder + 1)
            await updateCandidateStg(candidateToMove, moveToWorkflowStage?.id || nextStage?.id)
            setSelectedWorkflowStage(moveToWorkflowStage || nextStage)
            invalidateQuery(getCandidateInterviewsByStage)
            setOpenCandidateMoveConfirm(false)
            setCandidateToMove(null)
            setMoveToWorkflowStage(null)
          } catch (error) {
            toast.error(
              `Moving candidate to ${
                moveToWorkflowStage ? moveToWorkflowStage.stage?.name : "next"
              } stage failed - ${error.toString()}`
            )
          }
        }}
      >
        Are you sure you want to move the candidate to{" "}
        {moveToWorkflowStage ? moveToWorkflowStage.stage?.name : "next"} stage?
      </Confirm>

      {/* Mobile Menu */}
      <div className="flex flex-col space-y-4 mb-2 md:hidden lg:hidden">
        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {candidateNameHeader}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {candidateRatingDiv}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {candidateStageAndInterviewerDiv}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {rejectCandidateButton}
          {updateCandidateDetailsButton}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          <MoveToNextStageButton
            stagesOpen={stagesOpenMobile}
            setStagesOpen={setStagesOpenMobile}
          />
          <AddToPoolButton
            candidatePoolsOpen={candidatePoolsOpenMobile}
            setCandidatePoolsOpen={setCandidatePoolsOpenMobile}
          />
        </div>
      </div>

      {/* Tablet Menu */}
      <div className="hidden md:flex md:flex-col lg:hidden space-y-6 mb-3">
        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {candidateNameHeader}
          {candidateRatingDiv}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {candidateStageAndInterviewerDiv}
        </div>

        <div className="flex flex-nowrap items-center justify-center space-x-4">
          {rejectCandidateButton}
          {updateCandidateDetailsButton}
          <MoveToNextStageButton
            stagesOpen={stagesOpenTablet}
            setStagesOpen={setStagesOpenTablet}
          />
          <AddToPoolButton
            candidatePoolsOpen={candidatePoolsOpenTablet}
            setCandidatePoolsOpen={setCandidatePoolsOpenTablet}
          />
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex justify-between items-center space-x-4">
        <div className="flex flex-nowrap items-center space-x-4">
          {candidateNameHeader}
          {candidateRatingDiv}
          {candidateStageAndInterviewerDiv}
        </div>

        <div className="flex flex-nowrap items-center justify-end space-x-4">
          {rejectCandidateButton}
          {updateCandidateDetailsButton}
          <MoveToNextStageButton
            stagesOpen={stagesOpenDesktop}
            setStagesOpen={setStagesOpenDesktop}
          />
          <AddToPoolButton
            candidatePoolsOpen={candidatePoolsOpenDesktop}
            setCandidatePoolsOpen={setCandidatePoolsOpenDesktop}
          />
        </div>
      </div>

      <br />

      <Suspense fallback="Loading...">
        <div className="w-full flex flex-col md:flex-row lg:flex-row space-y-6 md:space-y-0 lg:space-y-0 md:space-x-0 lg:space-x-0">
          {/* PDF Viewer and Candidate Answers */}
          <div className="w-full md:w-3/5 lg:w-2/3">
            <div className="flex flex-col space-y-1 py-1 border-2 border-theme-400 rounded-lg md:mr-8 lg:mr-8">
              <div className="px-2 md:px-0 lg:px-0">
                {file && <PDFViewer file={file} scale={1.29} />}
              </div>
              <div className="flex flex-wrap justify-center px-2 md:px-0 lg:px-0">
                {candidate?.job?.form?.questions?.map((fq) => {
                  const answer = getCandidateAnswerForDisplay(fq, candidate)
                  // if (fq?.question?.name === "Resume") {
                  //   console.log("RESUME RESUME RESUME")
                  //   console.log(answer)
                  // }

                  return (
                    <Card key={fq.id}>
                      <div className="space-y-2">
                        <div className="w-full relative">
                          <div className="font-bold flex md:justify-center lg:justify:center items-center">
                            <span className="truncate">{fq.question.name}</span>
                          </div>
                        </div>
                        <div className="border-b-2 border-gray-50 w-full"></div>
                        <div className="flex md:justify-center lg:justify-center">
                          <span className="truncate">{answer || "NA"}</span>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Interviewing Info */}
          <div className="w-full md:w-2/5 lg:w-1/3">
            <div
              className={`w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl sticky top-0`}
            >
              <div className="w-full h-full rounded-2xl">
                <div className="z-10 flex w-full max-w-full overflow-auto bg-theme-50 justify-between sticky top-0">
                  {candidate?.job?.workflow?.stages?.map((ws, index) => {
                    return (
                      <div
                        key={`${ws.stage?.name}${index}`}
                        className={`${index > 0 ? "border-l-2 rounded-bl-md" : ""} ${
                          index < (candidate?.job?.workflow?.stages?.length || 0) - 1
                            ? "border-r-2 rounded-br-md"
                            : ""
                        } border-b-2 border-theme-400 p-1 bg-theme-50 min-w-fit overflow-clip hover:drop-shadow-2xl hover:bg-theme-200 cursor-pointer ${
                          selectedWorkflowStage?.id === ws.id ? "!bg-theme-500 !text-white" : ""
                        } whitespace-nowrap`}
                        onClick={() => {
                          setSelectedWorkflowStage(ws)
                          invalidateQuery(getCandidateInterviewsByStage)
                          // setScoreCardId(candidate?.job?.scoreCards?.find(sc => sc.workflowStageId === ws.id)?.scoreCardId || "")
                        }}
                      >
                        {ws.stage?.name?.length > 20
                          ? `${ws.stage?.name?.substring(0, 20)}...`
                          : ws?.stage?.name}
                      </div>
                    )
                  })}
                </div>
                <div className="w-full flex items-center justify-center mt-5">
                  <Form noFormatting={true} onSubmit={async (values) => {}}>
                    <LabeledToggleGroupField
                      name={`candidateToggleView`}
                      paddingX={3}
                      paddingY={1}
                      defaultValue={CandidateToggleView.Scores}
                      value={candidateToggleView}
                      options={Object.values(CandidateToggleView)?.map((toggleView) => {
                        return { label: toggleView, value: toggleView }
                      })}
                      onChange={(value) => {
                        setCandidateToggleView(value)
                      }}
                    />
                  </Form>
                </div>
                <Suspense fallback={<p className="p-7">Loading...</p>}>
                  {candidateToggleView === CandidateToggleView.Scores && (
                    <ScoreCard
                      // submitDisabled={
                      //   interviewDetail?.interviewer?.id !== user?.id
                      //   // selectedWorkflowStage?.interviewDetails?.find(
                      //   //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                      //   // )?.interviewerId !== user?.id
                      // }
                      key={selectedWorkflowStage?.id}
                      candidate={candidate}
                      header="Score Card"
                      // subHeader={`${
                      //   candidate?.job?.workflow?.stages?.find(
                      //     (ws) => ws.id === selectedWorkflowStage?.id
                      //   )?.stage?.name
                      // } Stage`}
                      scoreCardId={scoreCardId}
                      companyId={session.companyId || "0"}
                      preview={false}
                      userId={user?.id || "0"}
                      workflowStage={selectedWorkflowStage as any}
                      onSubmit={async (values) => {
                        const toastId = toast.loading(() => <span>Updating Candidate</span>)
                        try {
                          let linkedScoreCard: ExtendedScoreCard | null = null
                          if (candidate && !scoreCardId) {
                            linkedScoreCard = await linkScoreCardWithJobWorkflowStageMutation({
                              jobId: candidate?.jobId || "0",
                              workflowStageId:
                                selectedWorkflowStage?.id || candidate?.workflowStageId || "0",
                            })
                          }
                          await updateCandidateScoresMutation({
                            where: { id: candidate?.id },
                            data: {
                              id: candidate?.id,
                              jobId: candidate?.job?.id,
                              name: candidate?.name,
                              email: candidate?.email,
                              source: candidate?.source,
                              resume: candidate?.resume || undefined,
                              answers: (candidate?.answers || ([] as any)) as any,
                              scores:
                                (
                                  candidate?.job?.scoreCards?.find(
                                    (sc) => sc.workflowStageId === selectedWorkflowStage?.id
                                  )?.scoreCard || linkedScoreCard
                                )?.cardQuestions
                                  ?.map((sq) => {
                                    const rating = values[sq.cardQuestion?.name] || 0
                                    const note = values[`${sq.cardQuestion?.name} Note`]
                                    const scoreId = values[`${sq.cardQuestion?.name} ScoreId`]

                                    return {
                                      scoreCardQuestionId: sq.id,
                                      rating: rating ? parseInt(rating) : 0,
                                      note: note,
                                      id: scoreId || null,
                                      workflowStageId:
                                        selectedWorkflowStage?.id ||
                                        candidate?.workflowStageId ||
                                        "0",
                                    }
                                  })
                                  ?.filter((score) => score.rating > 0) || ([] as any),
                            },
                          })
                          // Stop resume from reloading by assigning previous value since resume won't be changed by this mutation
                          // setCandidate({ ...updatedCandidate, resume: candidate?.resume! })
                          await invalidateQuery(getCandidate)
                          toast.success(
                            () => (
                              <span>
                                Candidate Score Card Updated for stage{" "}
                                {selectedWorkflowStage?.stage?.name}
                              </span>
                            ),
                            { id: toastId }
                          )
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString()
                          )
                        }
                      }}
                      // scoreCardQuestions={
                      //   scoreCardJobWorkflowStage.scoreCard.cardQuestions as any as ExtendedScoreCardQuestion[]
                      // }
                    />
                  )}
                  {candidateToggleView === CandidateToggleView.Interviews && (
                    <Interviews
                      user={user}
                      selectedWorkflowStage={selectedWorkflowStage}
                      candidate={candidate}
                    />
                  )}
                  {candidateToggleView === CandidateToggleView.Comments && (
                    <Comments
                      user={user}
                      selectedWorkflowStage={selectedWorkflowStage}
                      candidate={candidate}
                    />
                  )}
                  {candidateToggleView === CandidateToggleView.Emails && (
                    <Emails
                      user={user}
                      selectedWorkflowStage={selectedWorkflowStage}
                      candidate={candidate}
                    />
                  )}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  )
}

export default SingleCandidatePage
