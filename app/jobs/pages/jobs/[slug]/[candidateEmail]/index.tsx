import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
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
import { AttachmentObject, CardType, ExtendedCandidate, ExtendedStage } from "types"
import axios from "axios"
import PDFViewer from "app/core/components/PDFViewer"
import { CandidateActivityType, CandidateFile, JobUserRole, Stage } from "@prisma/client"
import ScoreCard from "app/score-cards/components/ScoreCard"
import toast from "react-hot-toast"
import Form from "app/core/components/Form"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import updateCandidateScores from "app/candidates/mutations/updateCandidateScores"
import Modal from "app/core/components/Modal"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import getCandidateInterviewsByStage from "app/scheduling/interviews/queries/getCandidateInterviewsByStage"
import {
  ArrowRightIcon,
  BanIcon,
  BookmarkIcon,
  ChatAlt2Icon,
  ChatAltIcon,
  ChatIcon,
  ChevronDownIcon,
  ClockIcon,
  CollectionIcon,
  ColorSwatchIcon,
  DocumentAddIcon,
  DocumentRemoveIcon,
  MailIcon,
  MenuIcon,
  PencilAltIcon,
  ReceiptRefundIcon,
  RefreshIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
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
import ApplicationForm from "app/candidates/components/ApplicationForm"
import getCandidateInitialValues from "app/candidates/utils/getCandidateInitialValues"
import updateCandidate from "app/candidates/mutations/updateCandidate"
import Card from "app/core/components/Card"
import getJob from "app/jobs/queries/getJob"
import getCandidateAnswerForDisplay from "app/candidates/utils/getCandidateAnswerForDisplay"
import getCandidateInterviewer from "app/candidates/queries/getCandidateInterviewer"
import moment from "moment"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { z } from "zod"
import {
  AttachmentZodObj,
  CandidateFileObj,
  CandidateUserNoteObj,
} from "app/candidates/validations"
import createCandidateFile from "app/candidates/mutations/createCandidateFile"
import deleteCandidateFile from "app/candidates/mutations/deleteCandidateFile"
import { TerminalIcon, UserIcon } from "@heroicons/react/outline"
import saveCandidateUserNote from "app/candidates/mutations/saveCandidateUserNote"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import CandidateSelection from "app/candidates/components/CandidateSelection"
import getAllCandidatesByStage from "app/candidates/queries/getAllCandidatesByStage"
import getJobStages from "app/stages/queries/getJobStages"

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

  const { can: canRead } = await Guard.can(
    "read",
    "candidate",
    { session },
    {
      where: {
        jobId: job?.id,
        email: context?.params?.candidateEmail as string,
      },
    }
  )

  if (user) {
    try {
      if (!canRead) {
        throw new AuthorizationError()
      }

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
            candidateEmail: candidate?.email as string,
            jobId: candidate?.jobId,
            stageId: candidate?.stageId,
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

const getResume = async (key) => {
  if (key) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/getFile`
    const config = {
      headers: {
        "content-type": "application/json",
      },
    }
    const response = await axios.post(url, { key }, config)
    return response
  } else {
    return null
  }
}

const getCards = (candidate: ExtendedCandidate) => {
  return (
    candidate?.job?.formQuestions
      // ?.filter((q) => !q.question.factory)
      ?.map((question) => {
        const answer = getCandidateAnswerForDisplay(question, candidate)
        return {
          id: question.id,
          title: question.title,
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

// const getScoreCardJobWorkflowStage = (candidate, selectedStageId) => {
//   return candidate?.job?.scoreCards?.find(
//     (sc) => sc.workflowStageId === selectedStageId || candidate?.workflowStageId
//   )
// }

const SingleCandidatePage = ({
  user,
  error,
  candidateEmail,
  jobId,
  stageId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState(candidateEmail)
  const [viewCandidateSelection, setViewCandidateSelection] = useState(false)

  const handleWindowSizeChange = () => {
    setViewCandidateSelection(false)
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange)
    return () => window.removeEventListener("resize", handleWindowSizeChange)
  }, [])

  // const viewAllCandidatesRef = useRef(null)
  // const handleClick = (event) => {
  //   if (viewAllCandidatesRef && !(viewAllCandidatesRef?.current as any)?.contains(event.target)) {
  //     setViewCandidateSelection(false)
  //   }
  // }
  // useEffect(() => {
  //   window.addEventListener("mousedown", handleClick)
  //   return () => window.removeEventListener("mousedown", handleClick)
  // }, [])

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/candidates", breadcrumb: "Candidates" }]} />
      {viewCandidateSelection && (
        <div
          // ref={viewAllCandidatesRef}
          className="md:mt-56 lg:mt-24 absolute right-7 w-1/6 md:w-2/5 lg:w-1/3 h-screen z-10"
        >
          <Suspense fallback="Loading...">
            <CandidateSelection
              jobId={jobId || "0"}
              stageId={stageId || "0"}
              selectedCandidateEmail={selectedCandidateEmail || "0"}
              setSelectedCandidateEmail={setSelectedCandidateEmail}
            />
          </Suspense>
        </div>
      )}
      <br />
      <Suspense fallback="Loading...">
        <SingleCandidatePageContent
          user={user as any}
          error={error as any}
          candidateEmail={selectedCandidateEmail as any}
          jobId={jobId as any}
          viewCandidateSelection={viewCandidateSelection}
          setViewCandidateSelection={setViewCandidateSelection}
        />
      </Suspense>
    </AuthLayout>
  )
}

const SingleCandidatePageContent = ({
  user,
  error,
  candidateEmail,
  jobId,
  viewCandidateSelection,
  setViewCandidateSelection,
}: InferGetServerSidePropsType<typeof getServerSideProps> & {
  viewCandidateSelection?: boolean
  setViewCandidateSelection?: any
}) => {
  const router = useRouter()
  const { menu, stage, view } = router.query

  enum CandidateDetailToggleView {
    Info = "Info",
    Resume = "Resume",
    Files = "Files",
    Activity = "Activity",
    Notes = "Notes",
  }

  enum CandidateStageToggleView {
    Scores = "Scores",
    Interviews = "Interviews",
    Comments = "Comments",
    Emails = "Emails",
  }

  const [candidate] = useQuery(getCandidate, { where: { email: candidateEmail, jobId } })
  const [candidateStageToggleView, setCandidateStageToggleView] = useState(
    CandidateStageToggleView[view?.toString() || "Scores"] || CandidateStageToggleView.Scores
  )
  const [candidateDetailToggleView, setCandidateDetailToggleView] = useState(
    CandidateDetailToggleView[menu?.toString() || "Info"] || CandidateDetailToggleView.Info
  )

  const [saveCandidateUserNoteMutation] = useMutation(saveCandidateUserNote)

  const queryStage = candidate?.job?.stages?.find((stg) => stg.name === stage)
  const [selectedStage, setSelectedStage] = useState(
    (queryStage || candidate?.stage) as ExtendedStage | null | undefined
  )
  // Change selected stage to candidate's current stage
  // when candidate is changed using candidate selection menu
  useEffect(() => {
    if (candidate.stageId !== selectedStage?.id) {
      changeSelectedStage(queryStage || candidate.stage)
    }
  }, [candidate?.id])

  const changeSelectedStage = (stg) => {
    setSelectedStage(stg)
    router.replace({
      query: {
        ...router.query,
        stage:
          candidate?.job?.stages?.find((s) => s.name === stg.name)?.name ||
          candidate?.stage?.name ||
          "Sourced",
      },
    })
  }

  // const scoreCardId = candidate?.job?.scoreCards?.find(sc => sc.workflowStageId === selectedStage?.id)?.scoreCardId || ""
  // const [scoreCardId, setScoreCardId] = useState(
  //   candidate?.job?.scoreCards?.find((sc) => sc.workflowStageId === selectedStage?.id)
  //     ?.scoreCardId || ""
  // )
  // useEffect(() => {
  //   setScoreCardId(
  //     candidate?.job?.scoreCards?.find((sc) => sc.workflowStageId === selectedStage?.id)
  //       ?.scoreCardId || ""
  //   )
  // }, [candidate, selectedStage])

  // useEffect(() => {
  //   setSelectedStage(candidate?.stage)
  // }, [candidate?.stage])

  const [file, setFile] = useState(null as any)
  // const [cards, setCards] = useState(getCards(candidate!))
  // useEffect(() => {
  //   setCards(getCards(candidate!))
  // }, [candidate])

  const session = useSession()
  const [updateCandidateScoresMutation] = useMutation(updateCandidateScores)
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

  const [uploadFileOpen, setUploadFileOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null as CandidateFile | null)
  const [openConfirm, setOpenConfirm] = useState(false)

  const [createCandidateFileMutation] = useMutation(createCandidateFile)

  const resume = candidate?.resume as AttachmentObject
  useMemo(() => {
    if (resume?.key) {
      getResume(resume?.key).then((response) => {
        const file = response?.data?.Body
        setFile(file)
      })
    } else {
      setFile(null)
    }
  }, [resume.key])

  const [candidateToReject, setCandidateToReject] = useState(null as any)
  const [openCandidateRejectConfirm, setOpenCandidateRejectConfirm] = useState(false)
  const [setCandidateRejectedMutation] = useMutation(setCandidateRejected)

  const [openCandidateMoveConfirm, setOpenCandidateMoveConfirm] = useState(false)
  const [candidateToMove, setCandidateToMove] = useState(null as any)
  const [moveToStage, setMoveToStage] = useState(null as ExtendedStage | null | undefined)
  const [openEditModal, setOpenEditModal] = useState(false)

  const [updateCandidateStageMutation] = useMutation(updateCandidateStage)
  const [updateCandidateMutation] = useMutation(updateCandidate)
  const [deleteCandidateFileMutation] = useMutation(deleteCandidateFile)

  const [candidateInterviewer] = useQuery(getCandidateInterviewer, {
    candidateId: candidate?.id || "0",
    stageId: candidate?.stageId || "0",
  })

  // const [candidateWorkflowStageInterviewer] = useQuery(getCandidateWorkflowStageInterviewer, {
  //   where: { candidateId: candidate.id, workflowStageId: selectedStage?.id },
  // })

  // const getExistingCandidateInterviewer = useCallback(() => {
  //   const existingInterviewDetail = selectedStage?.interviewDetails?.find(
  //     (int) => int.workflowStageId === selectedStage?.id && int.jobId === candidate?.jobId
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
  //   selectedStage?.id,
  //   selectedStage?.interviewDetails,
  // ])

  // const [interviewDetail] = useQuery(getCandidateInterviewDetail, {
  //   stageId: candidate?.stageId!, // selectedStage?.id!,
  //   candidateId: candidate?.id,
  //   jobId: candidate?.jobId,
  // })

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

  const getCandidateActivitySymbolByType = (activityType: CandidateActivityType) => {
    switch (activityType) {
      case CandidateActivityType.Candidate_Added:
        return <UserIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Candidate_Updated:
        return <UserIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Candidate_Rejected:
        return <BanIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Candidate_Restored:
        return <RefreshIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Score_Submitted:
        return <StarIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Interviewer_Changed:
        return <UsersIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Stage_Changed:
        return <CollectionIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Interview_Scheduled:
        return <ClockIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Interview_Cancelled:
        return <XCircleIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Comment_Added:
        return <ChatAltIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Comment_Replied:
        return <ChatAlt2Icon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Comment_Edited:
        return (
          <span className="flex space-x-1">
            <ChatIcon className="text-theme-500 w-6 h-6" />
            <PencilAltIcon className="text-theme-500 w-6 h-6" />
          </span>
        )
      case CandidateActivityType.Comment_Deleted:
        return (
          <span className="flex space-x-1">
            <ChatIcon className="text-theme-500 w-6 h-6" />
            <TrashIcon className="text-theme-500 w-6 h-6" />
          </span>
        )
      case CandidateActivityType.Email_Sent:
        return <MailIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Email_Deleted:
        return (
          <span className="flex space-x-1">
            <MailIcon className="text-theme-500 w-6 h-6" />
            <TrashIcon className="text-theme-500 w-6 h-6" />
          </span>
        )
      case CandidateActivityType.Added_To_Pool:
        return <BookmarkIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.Removed_From_Pool:
        return (
          <span className="flex space-x-1">
            <ReceiptRefundIcon className="text-theme-500 w-6 h-6" />
          </span>
        )
      case CandidateActivityType.File_Added:
        return <DocumentAddIcon className="text-theme-500 w-6 h-6" />
      case CandidateActivityType.File_Deleted:
        return <DocumentRemoveIcon className="text-theme-500 w-6 h-6" />
      default:
        return <TerminalIcon className="text-theme-500 w-6 h-6" />
    }
  }

  const updateCandidateStg = async (candidate, selectedStageId) => {
    const selectedStageName =
      candidate?.job?.workflow?.stages?.find((ws) => ws.id === selectedStageId)?.stage?.name || ""

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
        data: { stageId: selectedStageId },
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
      key={candidate.id}
    >
      <LabeledRatingField
        name="candidateAverageRating"
        ratingClass={`!flex items-center`}
        height={8}
        color={candidate?.rejected ? "red" : "theme"}
        value={getScoreAverage(candidate?.scores?.map((score) => score.rating) || [])}
        disabled={true}
      />
    </Form>
  )

  const candidateStageAndInterviewerDiv = (
    <div className="px-3 py-1 rounded-lg border-2 border-theme-600 text-theme-700 font-semibold flex items-center justify-center space-x-2">
      <span>
        {(candidate?.stage?.name || "")?.length > 10
          ? `${candidate?.stage?.name?.replace(/ .*/, "")?.substring(0, 10)}...`
          : candidate?.stage?.name}
      </span>
      <ArrowRightIcon className="w-4 h-4" />
      <span>
        {(candidateInterviewer?.name || "")?.replace(/ .*/, "")?.length > 10
          ? `${candidateInterviewer?.name?.replace(/ .*/, "")?.substring(0, 10)}...`
          : candidateInterviewer?.name?.replace(/ .*/, "")}
      </span>
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

            if ((candidate?.stage?.order || 0) === (candidate?.job?.stages?.length || 0)) {
              toast.error("The candidate is already in the last stage")
              return
            } else {
              setCandidateToMove(candidate)
              setMoveToStage(null)
              setOpenCandidateMoveConfirm(true)
            }
          }}
        >
          Move to{" "}
          {(candidate?.stage?.order || 0) === (candidate?.job?.stages?.length || 0)
            ? "Next Stage"
            : (candidate?.job?.stages[candidate?.stage?.order || 0]?.name || "")?.length > 10
            ? `${candidate?.job?.stages[candidate?.stage?.order || 0]?.name
                ?.replace(/ .*/, "")
                ?.substring(0, 10)}...`
            : candidate?.job?.stages[candidate?.stage?.order || 0]?.name}
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
            {candidate?.job?.stages?.length === 0 && (
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
            {candidate?.job?.stages.map((stage) => {
              return (
                <DropdownMenu.Item
                  key={stage.id}
                  onSelect={async (e) => {
                    e.preventDefault()

                    if (candidate?.stage?.id === stage?.id) {
                      toast.error(`The candidate is already in the ${candidate?.stage?.name} stage`)
                    } else {
                      setCandidateToMove(candidate)
                      setMoveToStage(stage)
                      setOpenCandidateMoveConfirm(true)
                    }
                  }}
                  className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                >
                  {stage?.name?.length > 30 ? `${stage?.name?.substring(0, 30)}...` : stage?.name}
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
              // selectedStage?.interviewDetails?.find(
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
                    invalidateQuery(getCandidatePoolsWOPagination)
                    invalidateQuery(getCandidate)
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

  const OpenCloseViewAllCandidatesButton = () => {
    return viewCandidateSelection ? (
      <button
        onClick={() => {
          setViewCandidateSelection(false)
        }}
      >
        <XIcon className="w-6 h-6 text-theme-600 hover:text-theme-800" />
      </button>
    ) : (
      <button
        onClick={() => {
          setViewCandidateSelection(true)
        }}
      >
        <MenuIcon className="w-6 h-6 text-theme-600 hover:text-theme-800" />
      </button>
    )
  }

  return (
    <>
      <Modal header="Update Candidate" open={openEditModal} setOpen={setOpenEditModal}>
        <ApplicationForm
          header="Update Candidate"
          subHeader=""
          jobId={candidate?.job?.id || "0"}
          preview={false}
          initialValues={getCandidateInitialValues(candidate)}
          onSubmit={async (values) => {
            const toastId = toast.loading(`Updating Candidate`)
            try {
              const updatedCandidate = await updateCandidateMutation({
                where: { id: candidate?.id },
                // initial: candidate as any,
                data: {
                  id: candidate?.id,
                  jobId: candidate?.job?.id,
                  name: values.Name,
                  email: values.Email,
                  resume: values.Resume,
                  source: candidate?.source,
                  answers:
                    (candidate?.job?.formQuestions?.map((formQuestion) => {
                      const val = values[formQuestion?.title] || ""
                      return {
                        formQuestionId: formQuestion.id,
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
              invalidateQuery(getJobStages)
              invalidateQuery(getAllCandidatesByStage)
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
          moveToStage ? moveToStage?.name : "next"
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

            const stages = candidate?.job?.stages
            const currentStageOrder =
              stages?.find((stage) => stage.id === candidateToMove.stageId)?.order || 0
            const nextStage = stages?.find((stage) => stage.order === currentStageOrder + 1)
            await updateCandidateStg(candidateToMove, moveToStage?.id || nextStage?.id)
            changeSelectedStage(moveToStage || nextStage)
            invalidateQuery(getCandidateInterviewsByStage)
            invalidateQuery(getAllCandidatesByStage)
            invalidateQuery(getJobStages)
            setOpenCandidateMoveConfirm(false)
            setCandidateToMove(null)
            setMoveToStage(null)
          } catch (error) {
            toast.error(
              `Moving candidate to ${
                moveToStage ? moveToStage?.name : "next"
              } stage failed - ${error.toString()}`
            )
          }
        }}
      >
        Are you sure you want to move the candidate to {moveToStage ? moveToStage?.name : "next"}{" "}
        stage?
      </Confirm>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete File - ${(fileToDelete?.attachment as AttachmentObject | null)?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting File`)
          try {
            if (!fileToDelete) {
              throw new Error("No file set to delete")
            }
            await deleteCandidateFileMutation({ candidateFileId: fileToDelete.id })
            invalidateQuery(getCandidate)
            toast.success("File Deleted", { id: toastId })
          } catch (error) {
            toast.error(`Deleting file failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setFileToDelete(null)
        }}
      >
        Are you sure you want to delete the file?
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
          <OpenCloseViewAllCandidatesButton />
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
          <OpenCloseViewAllCandidatesButton />
        </div>
      </div>

      <Suspense fallback="Loading...">
        <div className="mt-8 md:mt-7 lg:mt-6 w-full flex flex-col md:flex-row lg:flex-row space-y-6 md:space-y-0 lg:space-y-0 md:space-x-0 lg:space-x-0">
          {/* PDF Viewer and Candidate Answers */}
          <div className="w-full md:w-3/5 lg:w-2/3">
            <div className="flex flex-col space-y-1 py-1 border-2 border-theme-400 rounded-lg md:mr-8 lg:mr-8">
              <div className="w-full flex items-center justify-center my-2">
                <Form noFormatting={true} onSubmit={async (values) => {}}>
                  <LabeledToggleGroupField
                    name={`candidateDetailToggleView`}
                    paddingX={3}
                    paddingY={1}
                    defaultValue={
                      CandidateDetailToggleView[menu?.toString() || "Info"] ||
                      CandidateDetailToggleView.Info
                    }
                    value={candidateDetailToggleView}
                    options={Object.values(CandidateDetailToggleView)?.map((toggleView) => {
                      return { label: toggleView, value: toggleView }
                    })}
                    onChange={(value) => {
                      setCandidateDetailToggleView(value)
                      router.replace({
                        query: {
                          ...router.query,
                          menu: value,
                        },
                      })
                    }}
                  />
                </Form>
              </div>
              {candidateDetailToggleView === CandidateDetailToggleView.Info && (
                <div className="flex flex-wrap justify-center px-2 md:px-0 lg:px-0">
                  {candidate?.job?.formQuestions?.map((question) => {
                    const answer = getCandidateAnswerForDisplay(question, candidate)

                    return (
                      <Card key={question.id}>
                        <div className="space-y-2">
                          <div className="w-full relative">
                            <div className="font-bold flex md:justify-center lg:justify:center items-center">
                              <span className="truncate">{question.title}</span>
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
              )}
              {candidateDetailToggleView === CandidateDetailToggleView.Resume && (
                <div className="px-2 md:px-0 lg:px-0">
                  {file && <PDFViewer file={file} scale={1.29} />}
                  {!(candidate?.resume as AttachmentObject)?.key && (
                    <div className="text-center my-3 px-2">
                      No Resume Uploaded. Upload one by clicking on the Update Candidate button.
                    </div>
                  )}
                </div>
              )}
              {candidateDetailToggleView === CandidateDetailToggleView.Files && (
                <div className="flex flex-col items-center">
                  {candidate?.files?.length === 0 ? (
                    <div className="text-center my-3 px-2">
                      No files uploaded. Click on the button below to upload a file.
                    </div>
                  ) : (
                    <div className="my-1 flex flex-wrap justify-center px-2 md:px-0 lg:px-0">
                      {candidate?.files?.map((file) => {
                        return (
                          <Card key={file.id}>
                            <div className="space-y-2">
                              <div className="w-full relative">
                                <div className="font-bold flex md:justify-center lg:justify:center items-center">
                                  <a
                                    href={(file.attachment as AttachmentObject).location}
                                    className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 md:px-6 lg:px-6 truncate"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {(file.attachment as AttachmentObject).name}
                                  </a>
                                </div>
                                <div className="absolute top-0.5 right-0">
                                  <button
                                    id={"delete-" + file.id}
                                    className="float-right text-red-600 hover:text-red-800"
                                    title="Delete File"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setFileToDelete(file)
                                      setOpenConfirm(true)
                                    }}
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              <div className="border-b-2 border-gray-50 w-full"></div>
                              <div className="flex md:justify-center lg:justify-center text-xs">
                                <span className="truncate">
                                  {moment(file.createdAt).local().fromNow()} by{" "}
                                  {file.createdBy?.name}
                                </span>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                  <button
                    className="my-2 text-white bg-theme-600 px-4 py-1 rounded-lg hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setUploadFileOpen(true)
                    }}
                  >
                    Upload File
                  </button>
                  <Modal header="Upload File" open={uploadFileOpen} setOpen={setUploadFileOpen}>
                    <Form
                      schema={CandidateFileObj}
                      header="Upload File"
                      subHeader="Select a file, then click Submit"
                      submitText="Submit"
                      onSubmit={async (values) => {
                        const toastId = toast.loading(() => <span>Uploading File</span>)
                        try {
                          values["candidateId"] = candidate?.id
                          await createCandidateFileMutation({
                            attachment: values.attachment,
                            candidateId: values.candidateId,
                          })
                          invalidateQuery(getCandidate)
                          toast.success("File uploaded", { id: toastId })
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString()
                          )
                        }
                        setUploadFileOpen(false)
                      }}
                    >
                      <SingleFileUploadField accept="" name="attachment" label="" />
                    </Form>
                  </Modal>
                </div>
              )}
              {candidateDetailToggleView === CandidateDetailToggleView.Activity && (
                <div className="flex flex-col items-center">
                  {candidate?.activities?.length === 0 ? (
                    <div className="text-center my-3 px-2">No activities yet.</div>
                  ) : (
                    <div className="my-2 flex flex-col justify-center px-2">
                      {candidate?.activities?.map((activity, index) => {
                        return (
                          <>
                            <Card key={activity.id} isFull={true} noMarginY={true}>
                              <div className="space-y-2">
                                <div className="w-full relative">
                                  <div className="font-medium flex md:justify-center lg:justify:center md:text-center lg:text-center items-center">
                                    {getCandidateActivitySymbolByType(activity.type)}
                                    <span className="ml-2">
                                      {activity.type.replaceAll("_", " ")}
                                    </span>
                                  </div>
                                </div>
                                <div className="border-b-2 border-gray-50 w-full" />
                                <div className="w-full relative">
                                  <div className="text-sm font-medium flex md:justify-center lg:justify:center md:text-center lg:text-center items-center">
                                    {activity.title}
                                  </div>
                                </div>
                                <div className="border-b-2 border-gray-50 w-full" />
                                <div className="flex md:justify-center lg:justify-center text-xs">
                                  <span className="truncate">
                                    {moment(activity.performedAt).local().fromNow()} -{" "}
                                    {moment(activity.performedAt)
                                      .local()
                                      .toDate()
                                      .toLocaleDateString()}{" "}
                                    {moment(activity.performedAt)
                                      .local()
                                      .toDate()
                                      .toLocaleTimeString()}
                                    {/* by {activity.performedByUser?.name} */}
                                  </span>
                                </div>
                              </div>
                            </Card>
                            {index !== candidate?.activities?.length - 1 && (
                              <div className="flex justify-center items-center">
                                <div className="h-10 w-1 border-2 border-neutral-300" />
                              </div>
                            )}
                          </>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              {candidateDetailToggleView === CandidateDetailToggleView.Notes && (
                <Form
                  key={
                    candidate?.candidateUserNotes &&
                    (candidate?.candidateUserNotes?.length || 0) > 0
                      ? candidate?.candidateUserNotes[0]?.id
                      : "0"
                  }
                  subHeader="These notes are private to you"
                  submitText="Save"
                  initialValues={{
                    note:
                      candidate?.candidateUserNotes &&
                      (candidate?.candidateUserNotes?.length || 0) > 0 &&
                      candidate?.candidateUserNotes[0]?.note
                        ? EditorState.createWithContent(
                            convertFromRaw(candidate?.candidateUserNotes[0]?.note || {})
                          )
                        : EditorState.createEmpty(),
                  }}
                  schema={CandidateUserNoteObj}
                  onSubmit={async (values) => {
                    if (values.note) {
                      values.note = convertToRaw(values?.note?.getCurrentContent() || {})
                    }

                    const toastId = toast.loading(() => <span>Saving Note</span>)
                    try {
                      await saveCandidateUserNoteMutation({
                        candidateId: candidate?.id || "0",
                        userId: session?.userId || "0",
                        note: values.note,
                      })
                      await invalidateQuery(getCandidate)
                      toast.success(() => "Note saved", { id: toastId })
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                      )
                    }
                  }}
                >
                  <LabeledRichTextField name="note" />
                </Form>
              )}
            </div>
          </div>

          {/* Interviewing Info */}
          <div className="w-full md:w-2/5 lg:w-1/3">
            <div
              className={`w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl sticky top-0`}
            >
              <div className="w-full h-full rounded-2xl">
                <div className="z-10 flex w-full max-w-full overflow-auto bg-theme-50 justify-between sticky top-0">
                  {candidate?.job?.stages?.map((stage, index) => {
                    return (
                      <div
                        key={`${stage?.name}${index}`}
                        className={`${index > 0 ? "border-l-2 rounded-bl-md" : ""} ${
                          index < (candidate?.job?.stages?.length || 0) - 1
                            ? "border-r-2 rounded-br-md"
                            : ""
                        } border-b-2 border-theme-400 p-1 bg-theme-50 min-w-fit overflow-clip hover:drop-shadow-2xl hover:bg-theme-200 cursor-pointer ${
                          selectedStage?.id === stage.id ? "!bg-theme-500 !text-white" : ""
                        } whitespace-nowrap`}
                        onClick={() => {
                          changeSelectedStage(stage)
                          invalidateQuery(getCandidateInterviewsByStage)
                          // setScoreCardId(candidate?.job?.scoreCards?.find(sc => sc.workflowStageId === ws.id)?.scoreCardId || "")
                        }}
                      >
                        {stage?.name?.length > 20
                          ? `${stage?.name?.substring(0, 20)}...`
                          : stage?.name}
                      </div>
                    )
                  })}
                </div>
                <div className="w-full flex items-center justify-center mt-5">
                  <Form noFormatting={true} onSubmit={async (values) => {}}>
                    <LabeledToggleGroupField
                      name={`candidateStageToggleView`}
                      paddingX={3}
                      paddingY={1}
                      defaultValue={
                        CandidateStageToggleView[view?.toString() || "Scores"] ||
                        CandidateStageToggleView.Scores
                      }
                      value={candidateStageToggleView}
                      options={Object.values(CandidateStageToggleView)?.map((toggleView) => {
                        return { label: toggleView, value: toggleView }
                      })}
                      onChange={(value) => {
                        setCandidateStageToggleView(value)
                        router.replace({
                          query: {
                            ...router.query,
                            view: value,
                          },
                        })
                      }}
                    />
                  </Form>
                </div>
                <Suspense fallback={<p className="p-7">Loading...</p>}>
                  {candidateStageToggleView === CandidateStageToggleView.Scores && (
                    <ScoreCard
                      // submitDisabled={
                      //   interviewDetail?.interviewer?.id !== user?.id
                      //   // selectedStage?.interviewDetails?.find(
                      //   //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                      //   // )?.interviewerId !== user?.id
                      // }
                      key={`${candidate?.id}-${selectedStage?.id}`}
                      candidate={candidate}
                      header="Score Card"
                      // subHeader={`${
                      //   candidate?.job?.workflow?.stages?.find(
                      //     (ws) => ws.id === selectedStage?.id
                      //   )?.stage?.name
                      // } Stage`}
                      // scoreCardId={scoreCardId}
                      // companyId={session.companyId || "0"}
                      preview={false}
                      userId={user?.id || "0"}
                      stageId={selectedStage?.id || "0"}
                      onSubmit={async (values) => {
                        const toastId = toast.loading(() => <span>Updating Candidate</span>)
                        try {
                          // let linkedScoreCard: ExtendedScoreCard | null = null
                          // if (candidate && !scoreCardId) {
                          //   linkedScoreCard = await linkScoreCardWithJobWorkflowStageMutation({
                          //     jobId: candidate?.jobId || "0",
                          //     workflowStageId:
                          //       selectedStage?.id || candidate?.workflowStageId || "0",
                          //   })
                          // }
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
                                selectedStage?.scoreCardQuestions
                                  ?.map((question) => {
                                    const rating = values[question?.title] || 0
                                    const note = values[`${question?.title} Note`]
                                    const scoreId = values[`${question?.title} ScoreId`]

                                    return {
                                      scoreCardQuestionId: question?.id,
                                      rating: rating ? parseInt(rating) : 0,
                                      note: note,
                                      id: scoreId || null,
                                      stageId: selectedStage?.id || candidate?.stageId || "0",
                                    }
                                  })
                                  ?.filter((score) => score?.rating > 0) || ([] as any),
                            },
                          })
                          // Stop resume from reloading by assigning previous value since resume won't be changed by this mutation
                          // setCandidate({ ...updatedCandidate, resume: candidate?.resume! })
                          await invalidateQuery(getCandidate)
                          toast.success(
                            () => (
                              <span>
                                Candidate Score Card Updated for stage {selectedStage?.name}
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
                  {candidateStageToggleView === CandidateStageToggleView.Interviews && (
                    <Interviews
                      user={user}
                      stageId={selectedStage?.id || "0"}
                      candidate={candidate}
                      key={`${candidate?.id}-${selectedStage?.id}`}
                    />
                  )}
                  {candidateStageToggleView === CandidateStageToggleView.Comments && (
                    <Comments
                      user={user}
                      stageId={selectedStage?.id || "0"}
                      candidate={candidate}
                      key={`${candidate?.id}-${selectedStage?.id}`}
                    />
                  )}
                  {candidateStageToggleView === CandidateStageToggleView.Emails && (
                    <Emails
                      user={user}
                      stageId={selectedStage?.id || "0"}
                      candidate={candidate}
                      key={`${candidate?.id}-${selectedStage?.id}`}
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
