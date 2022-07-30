import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  usePaginatedQuery,
  Link,
  Routes,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getTokens from "app/admin/queries/admin/getTokens"

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

const Tokens = ({ user }) => {
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
              {
                workspaceId: {
                  contains: JSON.parse(router.query.search as string),
                  mode: "insensitive",
                },
              },
              !isNaN(Number(JSON.parse(router.query.search as string))) &&
              Number(JSON.parse(router.query.search as string)) > 0
                ? {
                    id: Number(JSON.parse(router.query.search as string)),
                  }
                : {},
              !isNaN(Number(JSON.parse(router.query.search as string))) &&
              Number(JSON.parse(router.query.search as string)) > 0
                ? {
                    userId: Number(JSON.parse(router.query.search as string)),
                  }
                : {},
            ],
          }
        : {}

    setQuery(search)
  }, [router.query])

  const [{ tokens, hasMore, count }] = usePaginatedQuery(getTokens, {
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

    await tokens.forEach((token) => {
      data = [
        ...data,
        {
          ...token,
        },
      ]

      setData(data)
    })
  }, [tokens])

  const columns = [
    {
      Header: "Id",
      accessor: "id",
      Cell: (props) => {
        return (
          props.value && (
            <Link href={Routes.SingleTokenAdminPage({ id: props.cell.row.original.id })} passHref>
              <a className="text-indigo-600 hover:text-indigo-900">{props.value.toString()}</a>
            </Link>
          )
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
      Header: "LastFour",
      accessor: "lastFour",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Type",
      accessor: "type",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "ExpiresAt",
      accessor: "expiresAt",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "SentTo",
      accessor: "sentTo",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "UserId",
      accessor: "userId",
      Cell: (props) => {
        return (
          props.value && (
            <Link
              href={Routes.SingleUserAdminPage({ id: props.cell.row.original.userId })}
              passHref
            >
              <a className="text-indigo-600 hover:text-indigo-900">{props.value.toString()}</a>
            </Link>
          )
        )
      },
    },
    {
      Header: "WorkspaceId",
      accessor: "workspaceId",
      Cell: (props) => {
        return (
          props.value && (
            <Link
              href={Routes.SingleWorkspaceAdminPage({ id: props.cell.row.original.workspaceId })}
              passHref
            >
              <a className="text-indigo-600 hover:text-indigo-900">{props.value.toString()}</a>
            </Link>
          )
        )
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

const AdminToken = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | 1UpBlitz`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Tokens</p>
        </div>
        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Tokens user={user} />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminToken.authenticate = true

export default AdminToken
