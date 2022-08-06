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
import getEmails from "app/admin/queries/admin/getEmails"
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

const Emails = () => {
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

  const [{ emails, hasMore, count }] = usePaginatedQuery(getEmails, {
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

    await emails?.forEach((email) => {
      data = [
        ...data,
        {
          ...email,
        },
      ]

      setData(data)
    })
  }, [emails])

  const columns = [
    {
      Header: "Id",
      accessor: "id",

      Cell: (props) => {
        return (
          <Link
            href={Routes.SingleEmailAdminPage({
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
      Header: "Subject",
      accessor: "subject",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Cc",
      accessor: "cc",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Body",
      accessor: "body",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "TemplateUsed",
      accessor: "templateUsed",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "TemplateId",
      accessor: "templateId",

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
      Header: "Sender",
      accessor: "sender",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "SenderId",
      accessor: "senderId",

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

const AdminEmail = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | 1UpBlitz`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Emails</p>
        </div>

        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Emails />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminEmail.authenticate = true

export default AdminEmail
