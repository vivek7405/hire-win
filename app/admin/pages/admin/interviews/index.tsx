import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  usePaginatedQuery,
  Routes,
  Link,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getInterviews from "app/admin/queries/admin/getInterviews"
import AdminLayout from "app/core/layouts/AdminLayout"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const Interviews = () => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})

  useEffect(() => {
    const search =
      router.query.search && JSON.parse(router.query.search as string)
        ? {
            OR: [
              !isNaN(Number(JSON.parse(router.query.search as string))) &&
              Number(JSON.parse(router.query.search as string)) > 0
                ? {
                    id: Number(JSON.parse(router.query.search as string)),
                  }
                : {
                    id: {
                      contains: JSON.parse(router.query.search as string),
                      mode: "insensitive",
                    },
                  },
            ],
          }
        : {}

    setQuery(search)
  }, [router.query])

  const [{ interviews, hasMore, count }] = usePaginatedQuery(getInterviews, {
    where: {
      ...query,
    },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  // Use blitz guard to check if user can update t

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  useMemo(async () => {
    let data: {}[] = []

    await interviews?.forEach((interview) => {
      data = [
        ...data,
        {
          ...interview,
        },
      ]

      setData(data)
    })
  }, [interviews])

  const columns = [
    {
      Header: "Id",
      accessor: "id",

      Cell: (props) => {
        return (
          <Link
            href={Routes.SingleInterviewAdminPage({
              id: props.cell.row.original.id,
            })}
            passHref
          >
            <a className="text-indigo-600 hover:text-indigo-900">{props.value.toString()}</a>
          </Link>
        )
      },
    },
    {
      Header: "CreatedAt",
      accessor: "createdAt",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "UpdatedAt",
      accessor: "updatedAt",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Candidate",
      accessor: "candidate",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CandidateId",
      accessor: "candidateId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Job",
      accessor: "job",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "JobId",
      accessor: "jobId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "WorkflowStage",
      accessor: "workflowStage",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "WorkflowStageId",
      accessor: "workflowStageId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Organizer",
      accessor: "organizer",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "OrganizerId",
      accessor: "organizerId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Interviewer",
      accessor: "interviewer",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "InterviewerId",
      accessor: "interviewerId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "OtherAttendees",
      accessor: "otherAttendees",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "StartDateUTC",
      accessor: "startDateUTC",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Duration",
      accessor: "duration",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CalendarId",
      accessor: "calendarId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "EventId",
      accessor: "eventId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CalendarLink",
      accessor: "calendarLink",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "MeetingLink",
      accessor: "meetingLink",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CancelCode",
      accessor: "cancelCode",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Cancelled",
      accessor: "cancelled",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
  ]

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

const AdminInterview = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | 1UpBlitz`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Interviews</p>
        </div>

        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Interviews />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminInterview.authenticate = true

export default AdminInterview
