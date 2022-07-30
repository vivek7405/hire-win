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
import getQuestions from "app/admin/queries/admin/getQuestions"
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

const Questions = () => {
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

  const [{ questions, hasMore, count }] = usePaginatedQuery(getQuestions, {
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

    await questions.forEach((question) => {
      data = [
        ...data,
        {
          ...question,
        },
      ]

      setData(data)
    })
  }, [questions])

  const columns = [
    {
      Header: "Id",
      accessor: "id",

      Cell: (props) => {
        return (
          <Link
            href={Routes.SingleQuestionAdminPage({
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
      Header: "CreatedBy",
      accessor: "createdBy",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CreatedById",
      accessor: "createdById",

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
      Header: "Placeholder",
      accessor: "placeholder",

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
      Header: "Options",
      accessor: "options",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "AcceptedFiles",
      accessor: "acceptedFiles",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Factory",
      accessor: "factory",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Company",
      accessor: "company",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CompanyId",
      accessor: "companyId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Forms",
      accessor: "forms",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Answers",
      accessor: "answers",

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

const AdminQuestion = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Admin | 1UpBlitz`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Questions</p>
        </div>

        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Questions />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminQuestion.authenticate = true

export default AdminQuestion
