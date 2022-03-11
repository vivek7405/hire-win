import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getForms from "app/forms/queries/getForms"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
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

const Forms = ({ user }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
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

  const [{ forms, hasMore, count }] = usePaginatedQuery(getForms, {
    where: {
      userId: user?.id,
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

    await forms.forEach((form) => {
      data = [
        ...data,
        {
          ...form,
          canUpdate: form.userId === user.id,
        },
      ]

      setData(data)
    })
  }, [forms, user.id])

  let columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: (props) => {
        return (
          <Link href={Routes.SingleFormPage({ slug: props.cell.row.original.slug })} passHref>
            <a data-testid={`formlink`} className="text-theme-600 hover:text-theme-900">
              {props.cell.row.original.name}
            </a>
          </Link>
        )
      },
    },
    {
      Header: "Questions",
      Cell: (props) => {
        return props.cell.row.original.questions.length
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: (props) => {
        return (
          <>
            {props.cell.row.original.canUpdate && (
              <Link href={Routes.FormSettingsPage({ slug: props.cell.row.original.slug })} passHref>
                <a className="text-theme-600 hover:text-theme-900">Settings</a>
              </Link>
            )}
          </>
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

const FormsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="FormsHome | hire-win" user={user}>
      <Link href={Routes.NewForm()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Form
        </a>
      </Link>

      <Link href={Routes.QuestionsHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Question Pool
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Forms user={user} />
      </Suspense>
    </AuthLayout>
  )
}

FormsHome.authenticate = true

export default FormsHome
