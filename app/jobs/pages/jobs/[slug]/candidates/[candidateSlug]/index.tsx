import React, { Suspense, useEffect, useMemo, useState } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Link,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useRouter,
  usePaginatedQuery,
  dynamic,
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

import getCandidate from "app/jobs/queries/getCandidate"
import {
  AttachmentObject,
  CardType,
  DragDirection,
  ExtendedAnswer,
  ExtendedCandidate,
  ExtendedFormQuestion,
  ExtendedScoreCard,
  ExtendedScoreCardQuestion,
} from "types"
import axios from "axios"
import PDFViewer from "app/core/components/PDFViewer"
import {
  Candidate,
  CandidatePool,
  Interview,
  InterviewDetail,
  JobUser,
  QuestionType,
  ScoreCardJobWorkflowStage,
  User,
} from "@prisma/client"
import Cards from "app/core/components/Cards"
import Skeleton from "react-loading-skeleton"
import ScoreCard from "app/score-cards/components/ScoreCard"
import toast from "react-hot-toast"
import { titleCase } from "app/core/utils/titleCase"
import Form from "app/core/components/Form"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import updateCandidateScores from "app/jobs/mutations/updateCandidateScores"
import linkScoreCardWithJobWorkflowStage from "app/jobs/mutations/linkScoreCardWithJobWorkflowStage"
import Modal from "app/core/components/Modal"
import ScheduleInterview from "app/scheduling/interviews/components/ScheduleInterview"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import getCandidateInterviewsByStage from "app/scheduling/interviews/queries/getCandidateInterviewsByStage"
import moment from "moment"
import { ChevronDownIcon } from "@heroicons/react/outline"
import cancelInterview from "app/scheduling/interviews/mutations/cancelInterview"
import Confirm from "app/core/components/Confirm"
import Interviews from "app/scheduling/interviews/components/Interviews"
import Comments from "app/comments/components/Comments"
import Emails from "app/emails/components/Emails"
import getCandidatePools from "app/candidate-pools/queries/getCandidatePools"
import addCandidateToPool from "app/candidate-pools/mutations/addCandidateToPool"
import getScoreAverage from "app/score-cards/utils/getScoreAverage"

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
    "candidate",
    { session },
    { where: { slug: context?.params?.candidateSlug as string } }
  )

  if (user) {
    try {
      const candidate = await invokeWithMiddleware(
        getCandidate,
        {
          where: { slug: context?.params?.candidateSlug as string },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          candidate: candidate,
        },
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
        destination: `/login?next=jobs/${context?.params?.slug}/candidates/${context?.params?.candidateSlug}`,
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

const getResume = async (resume) => {
  if (resume) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/getFile`
    const config = {
      headers: {
        "content-type": "application/json",
      },
    }
    const response = await axios.post(url, resume, config)
    return response
  }
}

const getAnswer = (formQuestion: ExtendedFormQuestion, candidate: ExtendedCandidate) => {
  const answer: ExtendedAnswer = candidate?.answers?.find(
    (ans) => ans.question?.name === formQuestion?.question?.name
  )!

  if (answer) {
    const val = answer.value
    const type = answer?.question?.type

    switch (type) {
      case QuestionType.URL:
        return (
          <a
            href={val}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {val}
          </a>
        )
      case QuestionType.Multiple_select:
        const answerSelectedOptionIds: String[] = JSON.parse(val)
        const selectedOptions = answer?.question?.options
          ?.filter((op) => answerSelectedOptionIds?.includes(op.id))
          ?.map((op) => {
            return op.text
          })
        return JSON.stringify(selectedOptions)
      case QuestionType.Single_select:
        return answer?.question?.options?.find((op) => val === op.id)?.text
      case QuestionType.Attachment:
        const attachmentObj: AttachmentObject = JSON.parse(val)
        return (
          <a
            href={attachmentObj.Location}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {attachmentObj.Key}
          </a>
        )
      case QuestionType.Long_text:
        return <p className="max-w-md overflow-auto">{val}</p>
      default:
        return val
    }
  }

  return ""
}

const getCards = (candidate: ExtendedCandidate) => {
  return (
    candidate?.job?.form?.questions
      ?.sort((a, b) => {
        return (a?.order || 0) - (b?.order || 0)
      })
      // ?.filter((q) => !q.question.factory)
      ?.map((fq) => {
        const answer = getAnswer(fq, candidate)
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

const SingleCandidatePage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  enum CandidateToggleView {
    Scores = "Scores",
    Interviews = "Interviews",
    Comments = "Comments",
    Emails = "Emails",
  }

  const { user, error, canUpdate } = props
  const [candidate, setCandidate] = useState(props.candidate)
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
  }, [candidate, selectedWorkflowStage?.id])

  const [file, setFile] = useState(null as any)
  const [cards, setCards] = useState(getCards(candidate!))
  useEffect(() => {
    setCards(getCards(candidate!))
  }, [candidate])

  const session = useSession()
  const [updateCandidateScoresMutation] = useMutation(updateCandidateScores)
  const [linkScoreCardWithJobWorkflowStageMutation] = useMutation(linkScoreCardWithJobWorkflowStage)
  const [candidatePools] = useQuery(getCandidatePools, {
    where: { companyId: session.companyId || 0, candidates: { none: { id: candidate?.id } } },
  })
  const [candidatePoolsOpen, setCandidatePoolsOpen] = useState(false)
  const [addCandidateToPoolMutation] = useMutation(addCandidateToPool)

  const resume = candidate?.resume as AttachmentObject
  useMemo(() => {
    if (resume?.Key) {
      getResume(resume).then((response) => {
        const file = response?.data?.Body
        setFile(file)
      })
    }
  }, [resume])

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

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/candidates", breadcrumb: "Candidates" }]} />

      <br />

      <DropdownMenu.Root
        modal={false}
        open={candidatePoolsOpen}
        onOpenChange={setCandidatePoolsOpen}
      >
        <DropdownMenu.Trigger
          className="float-right ml-6 disabled:opacity-50 disabled:cursor-not-allowed text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center focus:outline-none"
          disabled={
            user?.jobs?.find((membership) => membership.jobId === candidate?.jobId)?.role !==
              "OWNER" &&
            user?.jobs?.find((membership) => membership.jobId === candidate?.jobId)?.role !==
              "ADMIN"
          }
        >
          <button
            className="flex px-2 py-1 justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              selectedWorkflowStage?.interviewDetails?.find(
                (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
              )?.interviewerId !== user?.id &&
              user?.jobs?.find((membership) => membership.jobId === candidate?.jobId)?.role !==
                "OWNER" &&
              user?.jobs?.find((membership) => membership.jobId === candidate?.jobId)?.role !==
                "ADMIN"
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
                    await invalidateQuery(getCandidatePools)
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
                {cp.name}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <div className="float-right cursor-pointer flex justify-center">
        <a className="text-white bg-theme-600 px-3 py-2 ml-6 hover:bg-theme-700 rounded-l-sm">
          Move to Stage
        </a>
        <a className="text-white bg-theme-600 p-1 hover:bg-theme-700 rounded-r-sm flex justify-center items-center">
          <ChevronDownIcon className="w-5 h-5" />
        </a>
      </div>

      {canUpdate && (
        <Link
          href={Routes.CandidateSettingsPage({
            slug: candidate?.job?.slug!,
            candidateSlug: candidate?.slug!,
          })}
          passHref
        >
          <a
            className="float-right underline text-theme-600 py-2 hover:text-theme-800"
            data-testid={`${candidate?.id}-settingsLink`}
          >
            Settings
          </a>
        </Link>
      )}

      <div className="flex items-center space-x-4">
        <h3 className="font-bold text-5xl text-theme-600">{candidate?.name}</h3>
        <Form
          noFormatting={true}
          onSubmit={async () => {
            return
          }}
        >
          <LabeledRatingField
            name="candidateAverageRating"
            ratingClass="!flex items-center"
            height={8}
            value={Math.round(
              getScoreAverage(candidate?.scores?.map((score) => score.rating) || [])
            )}
            disabled={true}
          />
        </Form>
      </div>

      <br />

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <div className="w-full flex flex-col md:flex-row lg:flex-row space-y-6 md:space-y-0 lg:space-y-0 md:space-x-8 lg:space-x-8">
          <div className="w-full md:w-1/2 lg:w-2/3 p-2 flex flex-col space-y-1 border-2 border-theme-400 rounded-lg">
            {file && <PDFViewer file={file} scale={1.29} />}
            <Cards
              cards={cards}
              setCards={setCards}
              noPagination={true}
              mutateCardDropDB={(source, destination, draggableId) => {}}
              droppableName="answers"
              isDragDisabled={true}
              direction={DragDirection.HORIZONTAL}
              noSearch={true}
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div
              className={`w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl sticky top-0`}
            >
              <div className="w-full h-full rounded-2xl">
                <div className="z-10 flex w-full max-w-full overflow-auto bg-theme-50 justify-between sticky top-0">
                  {candidate?.job?.workflow?.stages
                    ?.sort((a, b) => {
                      return a?.order - b?.order
                    })
                    ?.map((ws, index) => {
                      return (
                        <div
                          key={`${ws.stage?.name}${index}`}
                          className={`${index > 0 ? "border-l-2 rounded-bl-md" : ""} ${
                            index < (candidate?.job?.workflow?.stages?.length || 0) - 1
                              ? "border-r-2 rounded-br-md"
                              : ""
                          } border-b-2 border-theme-400 p-1 bg-theme-50 min-w-fit overflow-clip hover:drop-shadow-2xl hover:bg-theme-200 cursor-pointer ${
                            selectedWorkflowStage?.id === ws.id ? "!bg-theme-500 !text-white" : ""
                          }`}
                          onClick={() => {
                            setSelectedWorkflowStage(ws)
                            invalidateQuery(getCandidateInterviewsByStage)
                            // setScoreCardId(candidate?.job?.scoreCards?.find(sc => sc.workflowStageId === ws.id)?.scoreCardId || "")
                          }}
                        >
                          {ws.stage?.name}
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
                <Suspense
                  fallback={
                    <Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />
                  }
                >
                  {candidateToggleView === CandidateToggleView.Scores && (
                    <ScoreCard
                      submitDisabled={
                        selectedWorkflowStage?.interviewDetails?.find(
                          (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
                        )?.interviewerId !== user?.id
                      }
                      key={selectedWorkflowStage?.id}
                      candidate={candidate}
                      header="Score Card"
                      // subHeader={`${
                      //   candidate?.job?.workflow?.stages?.find(
                      //     (ws) => ws.id === selectedWorkflowStage?.id
                      //   )?.stage?.name
                      // } Stage`}
                      scoreCardId={scoreCardId}
                      companyId={session.companyId || 0}
                      preview={false}
                      userId={user?.id || 0}
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
                          const updatedCandidate = await updateCandidateScoresMutation({
                            where: { id: candidate?.id },
                            initial: candidate as any,
                            data: {
                              id: candidate?.id,
                              jobId: candidate?.job?.id,
                              name: candidate?.name,
                              email: candidate?.email,
                              source: candidate?.source,
                              resume: candidate?.resume || undefined,
                              answers: candidate?.answers || ([] as any),
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
                          setCandidate({ ...updatedCandidate, resume: candidate?.resume! })
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
    </AuthLayout>
  )
}

export default SingleCandidatePage
