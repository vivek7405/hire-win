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
import getJobs from "app/admin/queries/admin/getJobs"
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

const Jobs = () => {
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
          <Link
            href={Routes.SingleJobAdminPage({
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
      Header: "Title",
      accessor: "title",

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
      Header: "Country",
      accessor: "country",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "State",
      accessor: "state",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "City",
      accessor: "city",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Remote",
      accessor: "remote",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Hidden",
      accessor: "hidden",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "ShowSalary",
      accessor: "showSalary",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Currency",
      accessor: "currency",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "MinSalary",
      accessor: "minSalary",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "MaxSalary",
      accessor: "maxSalary",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "SalaryType",
      accessor: "salaryType",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "EmploymentType",
      accessor: "employmentType",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "ValidThrough",
      accessor: "validThrough",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Description",
      accessor: "description",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Tokens",
      accessor: "tokens",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Users",
      accessor: "users",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Category",
      accessor: "category",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "CategoryId",
      accessor: "categoryId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Workflow",
      accessor: "workflow",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "WorkflowId",
      accessor: "workflowId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Form",
      accessor: "form",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "FormId",
      accessor: "formId",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "ScoreCards",
      accessor: "scoreCards",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Interviews",
      accessor: "interviews",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "InterviewDetails",
      accessor: "interviewDetails",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "JobUserScheduleCalendars",
      accessor: "jobUserScheduleCalendars",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Candidates",
      accessor: "candidates",

      Cell: (props) => {
        return props.value && props.value.toString()
      },
    },
    {
      Header: "Archived",
      accessor: "archived",

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
    <AuthLayout title={`Admin | 1UpBlitz`} user={user}>
      <AdminLayout>
        <div className="bg-gray-200 w-full p-2 rounded text-gray-500">
          <p>Jobs</p>
        </div>

        <Suspense
          fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Jobs />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminJob.authenticate = true

export default AdminJob
