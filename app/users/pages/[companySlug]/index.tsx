import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  invokeWithMiddleware,
  Image,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getUser from "app/users/queries/getUser"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { AttachmentObject } from "types"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await invokeWithMiddleware(
    getUser,
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context }
  )

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

const Jobs = ({ user }) => {
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

  const [{ memberships, hasMore, count }] = usePaginatedQuery(getJobs, {
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

    await memberships.forEach((membership) => {
      data = [
        ...data,
        {
          ...membership.job,
          canUpdate: membership.role === "OWNER" || membership.role === "ADMIN",
        },
      ]

      setData(data)
    })
  }, [memberships])

  let columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: (props) => {
        return (
          <Link
            href={Routes.JobDescriptionPage({
              companySlug: user?.slug,
              jobSlug: props.cell.row.original.slug,
            })}
            passHref
          >
            <a data-testid={`joblink`} className="text-indigo-600 hover:text-indigo-900">
              {props.cell.row.original.name}
            </a>
          </Link>
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

const JobBoard = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const avatar: AttachmentObject = JSON.parse(JSON.stringify(user?.avatar)) || {
    Location: "",
    Key: "",
  }
  return (
    <AuthLayout title={`Job Board | ${user?.slug}`} user={user} hideNavbar={true}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <div className="flex justify-center items-center">
          <img
            src={avatar?.Location}
            alt={`${user?.company} logo`}
            width={200}
            className="self-center"
          />
        </div>
        {/* <br /><br /> */}
        <Jobs user={user} />
      </Suspense>
    </AuthLayout>
  )
}

export default JobBoard
