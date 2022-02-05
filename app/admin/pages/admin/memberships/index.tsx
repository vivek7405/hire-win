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
import AdminLayout from "app/core/layouts/AdminLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getMemberships from "app/admin/queries/admin/getMemberships"

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

const Memberships = ({ user }) => {
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
                jobId: {
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

  const [{ memberships, hasMore, count }] = usePaginatedQuery(getMemberships, {
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

    await memberships.forEach((membership) => {
      data = [
        ...data,
        {
          ...membership,
        },
      ]

      setData(data)
    })
  }, [memberships])

  const columns = [
    {
      Header: "Id",
      accessor: "id",
      Cell: (props) => {
        return (
          props.value && (
            <Link
              href={Routes.SingleMembershipAdminPage({ id: props.cell.row.original.id })}
              passHref
            >
              <a className="text-theme-600 hover:text-theme-900">{props.value.toString()}</a>
            </Link>
          )
        )
      },
    },
    {
      Header: "Role",
      accessor: "role",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "JobId",
      accessor: "jobId",
      Cell: (props) => {
        return (
          props.value && (
            <Link href={Routes.SingleJobAdminPage({ id: props.value.toString() })} passHref>
              <a className="text-theme-600 hover:text-theme-900">{props.value.toString()}</a>
            </Link>
          )
        )
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
              <a className="text-theme-600 hover:text-theme-900">{props.value.toString()}</a>
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

const AdminMembership = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | hire-win`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Memberships</p>
        </div>
        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Memberships user={user} />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminMembership.authenticate = true

export default AdminMembership
