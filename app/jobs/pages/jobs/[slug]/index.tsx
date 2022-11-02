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
  useMutation,
  useQuery,
  invalidateQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import Table from "app/core/components/Table"
import getCandidates from "app/candidates/queries/getCandidates"
import {
  AttachmentObject,
  ExtendedAnswer,
  ExtendedCandidate,
  ExtendedJob,
  KanbanBoardType,
  CardType,
  KanbanColumnType,
  ExtendedFormQuestion,
} from "types"
import {
  Answer,
  Candidate,
  CandidateSource,
  Company,
  CompanyUser,
  // Form as FormDB,
  // FormQuestion,
  Job,
  JobUser,
  JobUserRole,
  FormQuestion,
  FormQuestionType,
  User,
  FormQuestionOption,
} from "@prisma/client"

import getJobWithGuard from "app/jobs/queries/getJobWithGuard"
import Form from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import toast from "react-hot-toast"
import updateCandidate from "app/candidates/mutations/updateCandidate"
import updateCandidateStage from "app/candidates/mutations/updateCandidateStage"
import * as ToggleSwitch from "@radix-ui/react-switch"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import Debouncer from "app/core/utils/debouncer"
import Pagination from "app/core/components/Pagination"
import KanbanBoard from "app/core/components/KanbanBoard"
import getCompany from "app/companies/queries/getCompany"
import getCompanyUser from "app/companies/queries/getCompanyUser"
import canCreateNewCandidate from "app/candidates/queries/canCreateNewCandidate"
import Confirm from "app/core/components/Confirm"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import getScoreAverage from "app/score-cards/utils/getScoreAverage"
import { ArrowRightIcon, BanIcon, ExternalLinkIcon, RefreshIcon } from "@heroicons/react/outline"
import setCandidateRejected from "app/candidates/mutations/setCandidateRejected"
import Modal from "app/core/components/Modal"
import ApplicationForm from "app/candidates/components/ApplicationForm"
import createCandidate from "app/candidates/mutations/createCandidate"
import getCandidateInitialValues from "app/candidates/utils/getCandidateInitialValues"
import getCandidateAnswerForDisplay from "app/candidates/utils/getCandidateAnswerForDisplay"
import getCompanyUsers from "app/companies/queries/getCompanyUsers"
import { PencilIcon } from "@heroicons/react/solid"
import ViewJobListingButton from "app/jobs/components/ViewJobListingButton"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const companyUsers = await invokeWithMiddleware(
    getCompanyUsers,
    {
      where: {
        userId: session.userId || "0",
      },
    },
    { ...context }
  )

  let companyUser = await invokeWithMiddleware(
    getCompanyUser,
    {
      where: {
        companyId: session.companyId || "0",
        userId: session.userId || "0",
      },
    },
    { ...context }
  )

  if (user && !companyUser) {
    if (companyUsers && companyUsers.length > 0) {
      await session.$setPublicData({ companyId: companyUsers[0]?.companyId || "0" })
      companyUser = await invokeWithMiddleware(
        getCompanyUser,
        {
          where: {
            companyId: session.companyId || "0",
            userId: session.userId || "0",
          },
        },
        { ...context }
      )
    } else {
      return {
        redirect: {
          destination: "/companies/new",
          permanent: false,
        },
        props: {},
      }
    }
  }

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

  // const company = await invokeWithMiddleware(
  //   getCompany,
  //   {
  //     where: { id: session.companyId || "0" },
  //   },
  //   { ...context }
  // )

  if (user && companyUser) {
    try {
      const job = await invokeWithMiddleware(
        getJobWithGuard,
        {
          where: { slug: context?.params?.slug as string, companyId: session.companyId || "0" },
        },
        { ...context }
      )

      const { can: isFreeCandidateLimitAvailable } = await Guard.can(
        "isLimitAvailable",
        "freeCandidate",
        { session },
        {
          jobId: job?.id,
        }
      )

      return {
        props: {
          user,
          company: companyUser.company,
          canUpdate: canUpdate,
          job,
          isFreeCandidateLimitAvailable,
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
        destination: `/login?next=/jobs/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const getBoard = (
  job,
  user,
  candidates,
  viewRejected,
  setCandidateToReject,
  setOpenCandidateRejectConfirm,
  setCandidateToMove,
  setOpenCandidateMoveConfirm,
  enableDrag,
  setCandidateToEdit,
  setOpenModal
) => {
  return {
    columns: job?.stages?.map((stage) => {
      return {
        id: stage.id,
        title: stage?.name,
        cards: candidates
          ?.filter((c) => c.stageId === stage.id)
          .map((c) => {
            return {
              id: c.id,
              title: c.name,
              description: c.email,
              isDragDisabled: !enableDrag,
              renderContent: (
                <div>
                  <div className="font-bold flex items-center">
                    <Link
                      prefetch={true}
                      href={Routes.SingleCandidatePage({
                        slug: c.job?.slug,
                        candidateEmail: c.email,
                      })}
                      passHref
                    >
                      <a
                        className={`${
                          c.rejected
                            ? "text-red-600 hover:text-red-900"
                            : "text-theme-600 hover:text-theme-900"
                        } truncate`}
                      >
                        {c.name}
                      </a>
                    </Link>
                  </div>

                  <div className="border-b-2 my-2 border-gray-100 w-full"></div>
                  <div className="flex items-center">
                    <p className="truncate">{c.email}</p>
                  </div>

                  <div className="border-b-2 my-2 border-gray-100 w-full"></div>
                  <div className="flex items-center justify-between">
                    <Form
                      noFormatting={true}
                      onSubmit={async () => {
                        return
                      }}
                    >
                      <LabeledRatingField
                        name="candidateAverageRating"
                        ratingClass="!flex items-center"
                        height={5}
                        color={c.rejected ? "red" : "theme"}
                        value={getScoreAverage(c?.scores?.map((score) => score.rating) || [])}
                        disabled={true}
                      />
                    </Form>
                    {(user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role ===
                      JobUserRole.OWNER ||
                      user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role ===
                        JobUserRole.ADMIN) && (
                      <div className="flex items-center space-x-2">
                        <span>
                          <button
                            className="float-right text-theme-600 hover:text-theme-800"
                            title={"Edit Candidate"}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setCandidateToEdit(c)
                              setOpenModal(true)
                            }}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </span>
                        <span>
                          <button
                            className="float-right text-red-600 hover:text-red-800"
                            title={viewRejected ? "Restore Candidate" : "Reject Candidate"}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setCandidateToReject(c)
                              setOpenCandidateRejectConfirm(true)
                            }}
                          >
                            {viewRejected ? (
                              <RefreshIcon className="w-5 h-5" />
                            ) : (
                              <BanIcon className="w-5 h-5" />
                            )}
                          </button>
                        </span>
                        {!viewRejected && (
                          <span>
                            <button
                              className="float-right text-theme-600 hover:text-theme-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Move to next stage"
                              type="button"
                              disabled={c.stage?.order === job?.stages?.length}
                              onClick={(e) => {
                                e.preventDefault()
                                setCandidateToMove(c)
                                setOpenCandidateMoveConfirm(true)
                              }}
                            >
                              <ArrowRightIcon className="w-5 h-5" />
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ),
            }
          }) as CardType[],
      }
    }) as KanbanColumnType[],
  } as KanbanBoardType
}

type CandidateProps = {
  job: ExtendedJob
  user:
    | (User & {
        companies: (CompanyUser & {
          company: Company
        })[]
        jobs: (JobUser & {
          job: Job
        })[]
      })
    | undefined
  isTable: boolean
  viewRejected: boolean
  enableDrag: boolean
  setCandidateToEdit: any
  setOpenModal: any
}
const Candidates = (props: CandidateProps) => {
  const ITEMS_PER_PAGE = 25
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  // const [data, setData] = useState<ExtendedCandidate[]>([])
  const [updateCandidateStageMutation] = useMutation(updateCandidateStage)
  const [candidateToReject, setCandidateToReject] = useState(null as any)
  const [openCandidateRejectConfirm, setOpenCandidateRejectConfirm] = useState(false)
  const [setCandidateRejectedMutation] = useMutation(setCandidateRejected)
  const [candidateToMove, setCandidateToMove] = useState(null as any)
  const [openCandidateMoveConfirm, setOpenCandidateMoveConfirm] = useState(false)

  const [query, setQuery] = useState({})
  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            name: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

  useEffect(() => {
    invalidateQuery(getCandidates)
  }, [props.viewRejected])

  const [{ candidates, hasMore, count }] = usePaginatedQuery(getCandidates, {
    where: {
      jobId: props.job?.id,
      rejected: props.viewRejected ? true : false,
      ...query,
    },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  // useMemo(async () => {
  //   let data: ExtendedCandidate[] = []

  //   await candidates?.forEach((candidate) => {
  //     data = [...data, { ...(candidate as any) }]
  //     setData(data)
  //   })
  // }, [candidates])

  const getDynamicColumn = (formQuestion: ExtendedFormQuestion) => {
    return {
      Header: formQuestion?.title,
      Cell: (props) => {
        return getCandidateAnswerForDisplay(formQuestion, props.cell.row.original, true)
      },
    }
  }

  type ColumnType = {
    Header: string
    accessor?: string
    Cell?: (props) => any
  }
  let columns: ColumnType[] = [
    {
      Header: "Name",
      accessor: "name",
      Cell: (props) => {
        return (
          <>
            <Link
              prefetch={true}
              href={Routes.SingleCandidatePage({
                slug: props.cell.row.original.job?.slug,
                candidateEmail: props.cell.row.original.email,
              })}
              passHref
            >
              <a className="text-theme-600 hover:text-theme-900">{props.value}</a>
            </Link>
          </>
        )
      },
    },
    {
      Header: "Stage",
      accessor: "stage.name",
      // Cell: (props) => {
      //   const candidate = props.cell.row.original as ExtendedCandidate
      //   const stages =
      //     candidate?.job?.stages?.sort((a, b) => {
      //       return a.order - b.order
      //     }) || []
      //   const stage = props.value as ExtendedStage
      //   const [updateCandidateStageMutation] = useMutation(updateCandidateStage)

      //   return (
      //     <Form noFormatting={true} onSubmit={async (values) => {}}>
      //       <LabeledSelectField
      //         name={`candidate-${candidate?.id}-stage`}
      //         defaultValue={stages?.find((ws) => ws?.stage?.name === "Sourced")?.id || ""}
      //         value={stage?.id}
      //         options={stages.map((ws) => {
      //           return { label: ws?.stage?.name, value: ws?.id }
      //         })}
      //         onChange={async (e) => {
      //           const selectedStageId = e.target.value || ("" as string)
      //           updateCandidateStg(candidate, selectedStageId)
      //         }}
      //       />
      //     </Form>
      //   )
      // },
    },
    // {
    //   Header: "Stage",
    //   accessor: "stage",
    //   Cell: (props) => {
    //     const candidate = props.cell.row.original as ExtendedCandidate
    //     const stages =
    //       candidate?.job.stages?.sort((a, b) => {
    //         return a.order - b.order
    //       }) || []
    //     const stage = props.value as ExtendedStage
    //     const [updateCandidateStageMutation] = useMutation(updateCandidateStage)

    //     return (
    //       <Form noFormatting={true} onSubmit={async (values) => {}}>
    //         <LabeledSelectField
    //           name={`candidate-${candidate?.id}-stage`}
    //           defaultValue={stages?.find((ws) => ws?.stage?.name === "Sourced")?.id || ""}
    //           value={stage?.id}
    //           options={stages.map((ws) => {
    //             return { label: ws?.stage?.name, value: ws?.id }
    //           })}
    //           onChange={async (e) => {
    //             const selectedStageId = e.target.value || ("" as string)
    //             updateCandidateStg(candidate, selectedStageId)
    //           }}
    //         />
    //       </Form>
    //     )
    //   },
    // },
    {
      Header: "Source",
      accessor: "source",
      Cell: (props) => {
        return props.value.toString().replace("_", " ")
      },
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Resume",
      accessor: "resume",
      Cell: (props) => {
        const attachmentObj: AttachmentObject = props.value
        return (
          <a
            href={attachmentObj?.location}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {attachmentObj?.name}
          </a>
        )
      },
    },
  ]
  props.job?.formQuestions
    ?.filter((question) => question.allowEdit)
    ?.forEach((formQuestion) => {
      columns.push(getDynamicColumn(formQuestion))
    })

  // const setCandidateToEdit = props.setCandidateToEdit
  // const setOpenModal = props.setOpenModal
  // columns.push({
  //   Header: "",
  //   accessor: "action",
  //   Cell: (props) => {
  //     return (
  //       <>
  //         <button
  //           className="float-right text-theme-600 hover:text-theme-800"
  //           title={"Edit Candidate"}
  //           type="button"
  //           onClick={(e) => {
  //             e.preventDefault()
  //             setCandidateToEdit(props.cell.row.original as any)
  //             setOpenModal(true)
  //           }}
  //         >
  //           <PencilIcon className="w-5 h-5" />
  //         </button>
  //       </>
  //     )
  //   },
  // })

  const [board, setBoard] = useState(
    getBoard(
      props.job,
      props.user,
      candidates,
      props.viewRejected,
      setCandidateToReject,
      setOpenCandidateRejectConfirm,
      setCandidateToMove,
      setOpenCandidateMoveConfirm,
      props.enableDrag,
      props.setCandidateToEdit,
      props.setOpenModal
    ) as KanbanBoardType
  )
  useEffect(() => {
    setBoard(
      getBoard(
        props.job,
        props.user,
        candidates,
        props.viewRejected,
        setCandidateToReject,
        setOpenCandidateRejectConfirm,
        setCandidateToMove,
        setOpenCandidateMoveConfirm,
        props.enableDrag,
        props.setCandidateToEdit,
        props.setOpenModal
      )
    )
  }, [
    props.job,
    props.user,
    candidates,
    props.viewRejected,
    setCandidateToReject,
    setOpenCandidateRejectConfirm,
    props.enableDrag,
    props.setCandidateToEdit,
    props.setOpenModal,
  ])

  const updateCandidateStg = async (candidate, selectedStageId) => {
    const selectedStageName =
      props.job?.stages?.find((stage) => stage.id === selectedStageId)?.name || ""

    const toastId = toast.loading(() => (
      <span>
        <b>Setting stage as {selectedStageName}</b>
        <br />
        for candidate - {candidate?.name}
      </span>
    ))

    try {
      const updatedCandidate: ExtendedCandidate = await updateCandidateStageMutation({
        where: { id: candidate?.id },
        data: { stageId: selectedStageId },
      })
      // const candidateDataIndex = data.findIndex((c) => c.id === candidate?.id)
      // if (candidateDataIndex >= 0) {
      //   let newArr = [...data]
      //   newArr[candidateDataIndex] = updatedCandidate
      //   setData(newArr)
      // }
      invalidateQuery(getCandidates)
      // const candidateData = data.find((c) => c.id === candidate?.id)
      // if (candidateData) {
      //   candidateData.stageId = selectedStageId
      //   candidateData.stage =
      //     props.job?.stages?.find((ws) => ws.id === selectedStageId) || null
      //   setData([...data])
      // }
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

  const updateCandidate = async (source, destination, candidateId) => {
    if (source?.droppableId !== destination?.droppableId) {
      const candidate = candidates.find((c) => c.id === candidateId)
      const selectedStageId = destination?.droppableId || ("" as string)
      updateCandidateStg(candidate, selectedStageId)
    }
  }

  return (
    <>
      <Confirm
        open={openCandidateRejectConfirm}
        setOpen={setOpenCandidateRejectConfirm}
        header={`${props.viewRejected ? "Restore" : "Reject"} Candidate - ${
          candidateToReject?.name
        }`}
        onSuccess={async () => {
          const toastId = toast.loading(
            `${props.viewRejected ? "Restoring" : "Rejecting"} Candidate`
          )
          try {
            await setCandidateRejectedMutation({
              where: { id: candidateToReject?.id },
              rejected: !candidateToReject?.rejected,
            })
            toast.success(`Candidate ${props.viewRejected ? "Restored" : "Rejected"}`, {
              id: toastId,
            })
            setOpenCandidateRejectConfirm(false)
            setCandidateToReject(null as any)
            invalidateQuery(getCandidates)
          } catch (error) {
            toast.error(
              `${
                props.viewRejected ? "Restoring" : "Rejecting"
              } candidate failed - ${error.toString()}`,
              { id: toastId }
            )
          }
        }}
      >
        Are you sure you want to {props.viewRejected ? "Restore" : "Reject"} the candidate?
      </Confirm>
      <Confirm
        open={openCandidateMoveConfirm}
        setOpen={setOpenCandidateMoveConfirm}
        header={`Move Candidate - ${candidateToMove?.name} - to next stage`}
        onSuccess={async () => {
          const toastId = toast.loading(`Moving candidate to next stage`)
          try {
            // await moveCandidateMutation({
            //   where: { id: candidateToMove?.id },
            //   rejected: !candidateToMove?.rejected,
            // })

            const stages = props.job?.stages
            const currentStageOrder =
              stages?.find((ws) => ws.id === candidateToMove.stageId)?.order || 0
            const moveToStageId = stages?.find((ws) => ws.order === currentStageOrder + 1)?.id
            await updateCandidateStg(candidateToMove, moveToStageId)
            toast.success(`Candidate moved to next stage`, {
              id: toastId,
            })
            setOpenCandidateMoveConfirm(false)
            setCandidateToMove(null as any)
            invalidateQuery(getCandidates)
          } catch (error) {
            toast.error(`Moving candidate to next stage failed - ${error.toString()}`, {
              id: toastId,
            })
          }
        }}
      >
        Are you sure you want to move the candidate to next stage?
      </Confirm>
      {props.isTable ? (
        <>
          <br />
          <Table
            columns={columns}
            data={candidates}
            pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
            pageIndex={tablePage}
            pageSize={ITEMS_PER_PAGE}
            hasNext={hasMore}
            hasPrevious={tablePage !== 0}
            totalCount={count}
            startPage={startPage}
            endPage={endPage}
            noSearch={true}
            resultName="candidate"
          />
        </>
      ) : (
        <KanbanBoard
          board={board}
          setBoard={setBoard}
          mutateCardDropDB={updateCandidate}
          pageIndex={tablePage}
          hasNext={hasMore}
          hasPrevious={tablePage !== 0}
          totalCount={count}
          startPage={startPage}
          endPage={endPage}
          noSearch={true}
          resultName="candidate"
        />
      )}
    </>
  )
}

type CandidateCardProps = {
  candidate: ExtendedCandidate
  dragging: boolean
}
const CandidateCard = ({ candidate, dragging }: CandidateCardProps) => {
  return (
    <div className={`react-kanban-card ${dragging && `react-kanban-card--dragging`}`}>
      <h3 className="font-bold">{candidate?.name}</h3>
      <hr />
      <h6 className="">{candidate?.email}</h6>
    </div>
  )
}

const SingleJobPage = ({
  user,
  company,
  job,
  error,
  canUpdate,
  isFreeCandidateLimitAvailable,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
      <br />
      <Suspense fallback="Loading...">
        <SingleJobPageContent
          user={user as any}
          company={company as any}
          job={job as any}
          error={error as any}
          canUpdate={canUpdate as any}
          isFreeCandidateLimitAvailable={isFreeCandidateLimitAvailable}
        />
      </Suspense>
    </AuthLayout>
  )
}

const SingleJobPageContent = ({
  user,
  company,
  job,
  error,
  canUpdate,
  isFreeCandidateLimitAvailable,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [isTable, setTable] = useState(false)
  const [canCreateCandidate] = useQuery(canCreateNewCandidate, { jobId: job?.id || "0" })
  const [openConfirm, setOpenConfirm] = useState(false)
  const router = useRouter()
  const [viewRejected, setViewRejected] = useState(false)
  const [enableDrag, setEnableDrag] = useState(false)
  const [candidateToEdit, setCandidateToEdit] = useState(
    null as
      | (Candidate & {
          job: Job & {
            formQuestions: FormQuestion[]
          }
        } & {
          answers: (Answer & { formQuestion: FormQuestion })[]
        })
      | null
  )
  const [openModal, setOpenModal] = useState(false)
  const [createCandidateMutation] = useMutation(createCandidate)
  const [updateCandidateMutation] = useMutation(updateCandidate)

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.replace({
      query: {
        ...router.query,
        page: 0,
        ...searchQuery,
      },
    })
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e) => {
    e.persist()
    return debouncer.execute(e)
  }

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  const searchInput = (
    <input
      placeholder="Search"
      type="text"
      defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
      className={`border border-gray-300 px-2 py-2 rounded w-full mr-2`}
      onChange={(e) => {
        execDebouncer(e)
      }}
    />
  )

  const enableDragToggle = (
    <>
      {(user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role === JobUserRole.OWNER ||
        user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role === JobUserRole.ADMIN) && (
        <div className="text-theme-600 py-2 flex items-center justify-center">
          <Form
            noFormatting={true}
            onSubmit={(value) => {
              return value
            }}
          >
            <LabeledToggleSwitch
              name="toggleEnableDrag"
              label="Enable Drag"
              flex={true}
              value={enableDrag}
              onChange={(switchState) => {
                setEnableDrag(!enableDrag)
              }}
            />
          </Form>
        </div>
      )}
    </>
  )

  const viewRejectedToggle = (
    <div className="text-theme-600 py-2 flex items-center justify-center">
      <Form
        noFormatting={true}
        onSubmit={(value) => {
          return value
        }}
      >
        <LabeledToggleSwitch
          name="toggleViewRejected"
          label="View Rejected"
          flex={true}
          value={viewRejected}
          onChange={(switchState) => {
            setViewRejected(!viewRejected)
          }}
        />
      </Form>
    </div>
  )

  const tableViewToggle = (
    <div className="text-theme-600 py-2 flex items-center justify-center">
      <Form
        noFormatting={true}
        onSubmit={(value) => {
          return value
        }}
      >
        <LabeledToggleSwitch
          name="toggleTableView"
          label="Table View"
          flex={true}
          value={isTable}
          onChange={(switchState) => {
            setTable(!isTable)
          }}
        />
      </Form>
    </div>
  )

  const jobSettingsLink = (
    <Link
      prefetch={true}
      href={
        canUpdate
          ? Routes.JobSettingsPage({ slug: job?.slug! })
          : Routes.JobSettingsSchedulingPage({ slug: job?.slug! })
      }
      passHref
    >
      <a
        className="underline whitespace-nowrap text-theme-600 py-2 hover:text-theme-800"
        data-testid={`${job?.title && `${job?.title}-`}settingsLink`}
      >
        Job Settings
      </a>
    </Link>
  )

  const newCandidateButton = (
    <button
      className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      disabled={
        user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role !== JobUserRole.OWNER &&
        user?.jobs?.find((jobUser) => jobUser.jobId === job?.id)?.role !== JobUserRole.ADMIN
      }
      onClick={(e) => {
        if (isFreeCandidateLimitAvailable) {
          // router.push(Routes.NewCandidate({ slug: job?.slug! }))
          e.preventDefault()
          setCandidateToEdit(null as any)
          setOpenModal(true)
        } else {
          setOpenConfirm(true)
        }
      }}
    >
      New Candidate
    </button>
  )

  return (
    <>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Upgrade to the Pro Plan?"
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
      >
        You have reached the maximum candidates limit on the free plan. Upgrade to the PRO plan to
        add unlimited jobs and candidates.
      </Confirm>

      <Modal
        header={`${candidateToEdit ? "Update" : "Create"} Candidate`}
        open={openModal}
        setOpen={setOpenModal}
      >
        <ApplicationForm
          header={`${candidateToEdit ? "Update" : "Create"} Candidate`}
          subHeader=""
          jobId={job?.id || "0"}
          preview={false}
          initialValues={candidateToEdit ? getCandidateInitialValues(candidateToEdit) : {}}
          onSubmit={async (values) => {
            const toastId = toast.loading(`${candidateToEdit ? "Updating" : "Creating"} Candidate`)
            try {
              candidateToEdit
                ? await updateCandidateMutation({
                    where: { id: candidateToEdit?.id },
                    // initial: candidateToEdit as any,
                    data: {
                      id: candidateToEdit?.id,
                      jobId: candidateToEdit?.job?.id,
                      name: values.Name,
                      email: values.Email,
                      resume: values.Resume,
                      source: candidateToEdit?.source,
                      answers:
                        (candidateToEdit?.job?.formQuestions?.map((formQuestion) => {
                          const val = values[formQuestion?.title] || ""
                          return {
                            formQuestionId: formQuestion.id,
                            value: typeof val === "string" ? val : JSON.stringify(val),
                          }
                        }) as any) || ([] as any),
                    },
                  })
                : await createCandidateMutation({
                    jobId: job?.id,
                    name: values.Name,
                    email: values.Email,
                    resume: values.Resume,
                    source: CandidateSource.Manual,
                    answers:
                      job?.formQuestions?.map((formQuestion) => {
                        const val = values[formQuestion?.title] || ""
                        return {
                          formQuestionId: formQuestion.id,
                          value: typeof val === "string" ? val : JSON.stringify(val),
                        }
                      }) || [],
                  })
              toast.success(`Candidate ${candidateToEdit ? "updated" : "created"}`, { id: toastId })
              invalidateQuery(getCandidates)
            } catch (error) {
              toast.error("Something went wrong - " + error.toString(), { id: toastId })
            }
            setOpenModal(false)
          }}
        />
      </Modal>

      {!isFreeCandidateLimitAvailable && (
        <div className="flex flex-col items-center text-red-600">
          <h1 className="font-semibold">{`Free Candidate Limit Reached`}</h1>
          <h1 className="text-sm text-justify">{`Your job listing page has been taken down. Please upgrade to the PRO plan to get it up again and keep adding more candidates`}</h1>
          {/* <h1 className="text-sm">{`Please upgrade to the PRO plan to get it up again and keep adding more candidates`}</h1> */}
          <br />
        </div>
      )}

      {/* Mobile Menu */}
      <div className="flex flex-col space-y-4 md:hidden lg:hidden">
        <div className="flex w-full justify-between">
          {searchInput}
          {newCandidateButton}
        </div>

        <div className="flex w-full justify-between">
          <ViewJobListingButton companySlug={company?.slug || "0"} jobSlug={job?.slug || "0"} />
          {jobSettingsLink}
        </div>

        <div className="flex w-full justify-between">
          {viewRejectedToggle}
          {tableViewToggle}
        </div>
      </div>

      {/* Tablet Menu */}
      <div className="hidden lg:hidden md:flex md:flex-col space-y-4">
        <div className="w-full flex flex-nowrap">
          <div className="w-1/6">{searchInput}</div>

          <div className="flex w-5/6 space-x-3 flex-nowrap justify-end">
            <ViewJobListingButton companySlug={company?.slug || "0"} jobSlug={job?.slug || "0"} />
            {jobSettingsLink}
            {newCandidateButton}
          </div>
        </div>

        <div className="flex space-x-4 w-full justify-center">
          {enableDragToggle}
          {viewRejectedToggle}
          {tableViewToggle}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:hidden w-full lg:flex lg:flex-nowrap">
        <div className="w-1/6">{searchInput}</div>

        <div className="flex w-5/6 space-x-3 flex-nowrap justify-end">
          {enableDragToggle}
          {viewRejectedToggle}
          {tableViewToggle}
          <ViewJobListingButton companySlug={company?.slug || "0"} jobSlug={job?.slug || "0"} />
          {jobSettingsLink}
          {newCandidateButton}
        </div>
      </div>

      <Suspense fallback="Loading...">
        <Candidates
          job={job as any}
          user={user}
          isTable={isTable}
          viewRejected={viewRejected}
          enableDrag={enableDrag}
          setCandidateToEdit={setCandidateToEdit}
          setOpenModal={setOpenModal}
        />
      </Suspense>
    </>
  )
}

SingleJobPage.authenticate = true

export default SingleJobPage
