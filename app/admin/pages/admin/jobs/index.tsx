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
import getJobs from "app/admin/queries/admin/getJobs"

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

const Jobs = ({ user }) => {
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
                name: {
                  contains: JSON.parse(router.query.search as string),
                  mode: "insensitive",
                },
              },
              {
                id: {
                  contains: JSON.parse(router.query.search as string),
                  mode: "insensitive",
                },
              },
              {
                slug: {
                  contains: JSON.parse(router.query.search as string),
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}

    setQuery(search)
  }, [router.query])

  const [{ jobs, hasMore, count }] = usePaginatedQuery(getJobs, {
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

    await jobs.forEach((job) => {
      data = [
        ...data,
        {
          ...job,
        },
      ]

      setData(data)
    })
  }, [jobs])

  const columns = [
    {
      Header: "Id",
      accessor: "id",
      Cell: (props) => {
        return (
          props.value && (
            <Link href={Routes.SingleJobAdminPage({ id: props.cell.row.original.id })} passHref>
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
      Header: "ModifiedAt",
      accessor: "modifiedAt",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Slug",
      accessor: "slug",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "StripeCustomerId",
      accessor: "stripeCustomerId",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "StripeSubscriptionId",
      accessor: "stripeSubscriptionId",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "StripePriceId",
      accessor: "stripePriceId",
      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "StripeCurrentPeriodEnd",
      accessor: "stripeCurrentPeriodEnd",
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

const AdminJob = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | hire-win`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Jobs</p>
        </div>
        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Jobs user={user} />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminJob.authenticate = true

export default AdminJob
