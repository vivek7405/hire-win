import React, { Children, Suspense, useEffect, useMemo, useState } from "react"
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
  dynamic,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import Table from "app/core/components/Table"
import getCandidates from "app/jobs/queries/getCandidates"
import {
  AttachmentObject,
  ExtendedAnswer,
  ExtendedCandidate,
  ExtendedJob,
  ExtendedWorkflowStage,
  KanbanBoardType,
  CardType,
  KanbanColumnType,
} from "types"
import { QuestionType } from ".prisma1/client"
import Skeleton from "react-loading-skeleton"
import getJobWithGuard from "app/jobs/queries/getJobWithGuard"
import Form from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import toast from "react-hot-toast"
import updateCandidate from "app/jobs/mutations/updateCandidate"
import updateCandidateStage from "app/jobs/mutations/updateCandidateStage"
import * as ToggleSwitch from "@radix-ui/react-switch"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import getCandidatesWOPagination from "app/jobs/queries/getCandidatesWOPagination"
import Debouncer from "app/core/utils/debouncer"
import Pagination from "app/core/components/Pagination"
import KanbanBoard from "app/core/components/KanbanBoard"

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
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      const job = await invokeWithMiddleware(
        getJobWithGuard,
        {
          where: { slug: context?.params?.slug as string },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          job: job,
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

const getBoard = (job, candidates) => {
  return {
    columns: job?.workflow?.stages
      ?.sort((a, b) => {
        return a.order - b.order
      })
      .map((ws) => {
        return {
          id: ws.id,
          title: ws.stage?.name,
          cards: candidates
            ?.filter((c) => c.workflowStageId === ws.id)
            .map((c) => {
              return {
                id: c.id,
                title: c.name,
                description: c.email,
                renderContent: (
                  <div>
                    <span>
                      <div className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between">
                        <Link
                          href={Routes.SingleCandidatePage({
                            slug: c.job?.slug,
                            candidateSlug: c.slug,
                          })}
                          passHref
                        >
                          <a className="text-theme-600 hover:text-theme-900">{c.name}</a>
                        </Link>
                      </div>
                    </span>
                    <div className="pt-2.5">{c.email}</div>
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
  isKanban: Boolean
}
const Candidates = (props: CandidateProps) => {
  const ITEMS_PER_PAGE = 25
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedCandidate[]>([])
  const [query, setQuery] = useState({})
  const [updateCandidateStageMutation] = useMutation(updateCandidateStage)

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

  const [{ candidates, hasMore, count }] = usePaginatedQuery(getCandidates, {
    where: {
      jobId: props.job?.id,
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

  useMemo(async () => {
    let data: ExtendedCandidate[] = []

    await candidates.forEach((candidate) => {
      data = [...data, { ...(candidate as any) }]
      setData(data)
    })
  }, [candidates])

  const getDynamicColumn = (formQuestion) => {
    return {
      Header: formQuestion?.question?.name,
      Cell: (props) => {
        const answer: ExtendedAnswer = props.cell.row.original?.answers?.find(
          (ans) => ans.question?.name === formQuestion?.question?.name
        )

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
              href={Routes.SingleCandidatePage({
                slug: props.cell.row.original.job?.slug,
                candidateSlug: props.cell.row.original.slug,
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
      accessor: "workflowStage",
      Cell: (props) => {
        const candidate = props.cell.row.original as ExtendedCandidate
        const stages =
          candidate?.job.workflow?.stages?.sort((a, b) => {
            return a.order - b.order
          }) || []
        const workflowStage = props.value as ExtendedWorkflowStage
        const [updateCandidateStageMutation] = useMutation(updateCandidateStage)

        return (
          <Form noFormatting={true} onSubmit={async (values) => {}}>
            <LabeledSelectField
              name={`candidate-${candidate?.id}-stage`}
              defaultValue={stages?.find((ws) => ws?.stage?.name === "Sourced")?.id || ""}
              value={workflowStage?.id}
              options={stages.map((ws) => {
                return { label: ws?.stage?.name, value: ws?.id }
              })}
              onChange={async (e) => {
                const selectedWorkflowStageId = e.target.value || ("" as string)
                updateCandidateStg(candidate, selectedWorkflowStageId)
              }}
            />
          </Form>
        )
      },
    },
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
        const attachmentObj = props.value
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
      },
    },
  ]
  props.job?.form?.questions
    ?.filter((q) => !q.question.factory)
    ?.forEach((formQuestion) => {
      columns.push(getDynamicColumn(formQuestion))
    })

  columns.push({
    Header: "",
    accessor: "action",
    Cell: (props) => {
      return (
        <>
          <Link
            href={Routes.CandidateSettingsPage({
              slug: props.cell.row.original.job?.slug,
              candidateSlug: props.cell.row.original.slug,
            })}
            passHref
          >
            <a className="text-theme-600 hover:text-theme-900">Settings</a>
          </Link>
        </>
      )
    },
  })

  const [board, setBoard] = useState(getBoard(props.job, candidates) as KanbanBoardType)
  useEffect(() => {
    setBoard(getBoard(props.job, data))
  }, [props.job, data])

  const updateCandidateStg = async (candidate, selectedWorkflowStageId) => {
    const selectedStageName =
      props.job?.workflow?.stages?.find((ws) => ws.id === selectedWorkflowStageId)?.stage?.name ||
      ""

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
        data: { workflowStageId: selectedWorkflowStageId },
      })
      const candidateDataIndex = data.findIndex((c) => c.id === candidate?.id)
      if (candidateDataIndex >= 0) {
        let newArr = [...data]
        newArr[candidateDataIndex] = updatedCandidate
        setData(newArr)
      }
      // const candidateData = data.find((c) => c.id === candidate?.id)
      // if (candidateData) {
      //   candidateData.workflowStageId = selectedWorkflowStageId
      //   candidateData.workflowStage =
      //     props.job?.workflow?.stages?.find((ws) => ws.id === selectedWorkflowStageId) || null
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
      const selectedWorkflowStageId = destination?.droppableId || ("" as string)
      updateCandidateStg(candidate, selectedWorkflowStageId)
    }
  }

  return !props.isKanban ? (
    <Table
      columns={columns}
      data={data}
      pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
      pageIndex={tablePage}
      pageSize={ITEMS_PER_PAGE}
      hasNext={hasMore}
      hasPrevious={tablePage !== 0}
      totalCount={count}
      startPage={startPage}
      endPage={endPage}
      resultName="candidate"
    />
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
    />
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
  job,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [isKanban, setKanban] = useState(false)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
      <br />
      <Link href={Routes.NewCandidate({ slug: job?.slug! })} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Candidate
        </a>
      </Link>
      {canUpdate && (
        <Link href={Routes.JobSettingsPage({ slug: job?.slug! })} passHref>
          <a
            className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800"
            data-testid={`${job?.title && `${job?.title}-`}settingsLink`}
          >
            Job Settings
          </a>
        </Link>
      )}
      <div className="float-right text-theme-600 py-2">
        <Form
          noFormatting={true}
          onSubmit={(value) => {
            return value
          }}
        >
          <LabeledToggleSwitch
            name="toggleKanbanLayout"
            label="Kanban Board"
            flex={true}
            value={isKanban}
            onChange={(switchState) => {
              setKanban(switchState)
            }}
          />
        </Form>
      </div>
      <Link
        href={Routes.JobDescriptionPage({ companySlug: user?.slug!, jobSlug: job?.slug! })}
        passHref
      >
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800"
        >
          <span className="mr-1">View Job Listing</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </Link>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Candidates job={job as any} isKanban={isKanban} />
      </Suspense>
    </AuthLayout>
  )
}

export default SingleJobPage
