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
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getJob from "app/jobs/queries/getJob"
import Table from "app/core/components/Table"
import getCandidates from "app/jobs/queries/getCandidates"
import { AttachmentObject, ExtendedAnswer, ExtendedJob } from "types"
import Skeleton from "react-loading-skeleton"
import { QuestionType } from "@prisma/client"

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
        getJob,
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

type CandidateProps = {
  job: ExtendedJob
}
const Candidates = (props: CandidateProps) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            job: {
              name: {
                contains: JSON.parse(router.query.search as string),
                mode: "insensitive",
              },
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

  // Use blitz guard to check if user can update

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  useMemo(async () => {
    let data: {}[] = []

    await candidates.forEach((candidate) => {
      data = [
        ...data,
        {
          ...candidate,
        },
      ]

      setData(data)
    })
  }, [candidates])

  type ColumnType = {
    Header: string
    accessor?: string
    Cell?: (props) => any
  }
  let columns: ColumnType[] = [
    {
      Header: "Id",
      Cell: (props) => {
        return (
          <>
            <Link
              href={Routes.SingleCandidatePage({
                slug: props.cell.row.original.job?.slug,
                id: props.cell.row.original.id,
              })}
              passHref
            >
              <a className="text-indigo-600 hover:text-indigo-900">{props.cell.row.original.id}</a>
            </Link>
          </>
        )
      },
    },
    {
      Header: "Source",
      accessor: "source",
    },
  ]
  props.job?.form?.questions?.forEach((formQuestion) => {
    columns.push({
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
                  className="text-indigo-600 hover:text-indigo-500"
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
                  className="text-indigo-600 hover:text-indigo-500"
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
    })
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
              id: props.cell.row.original.id,
            })}
            passHref
          >
            <a className="text-indigo-600 hover:text-indigo-900">Settings</a>
          </Link>
        </>
      )
    },
  })

  return (
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
    />
  )
}

const CandidatesHome = ({
  user,
  job,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
      <br />
      <Link href={Routes.NewCandidate({ slug: job?.slug! })} passHref>
        <a className="float-right text-white bg-indigo-600 px-4 py-2 rounded-sm hover:bg-indigo-700">
          New Candidate
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Candidates job={job as any} />
      </Suspense>
    </AuthLayout>
  )
}

export default CandidatesHome