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
import { AttachmentObject, ExtendedJob } from "types"
import { titleCase } from "app/core/utils/titleCase"
import draftToHtml from "draftjs-to-html"
import { Country, State } from "country-state-city"
import moment from "moment"
import JobApplicationLayout from "app/core/layouts/JobApplicationLayout"

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
              title: {
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
      Header: "Job Openings",
      accessor: "title",
      Cell: (props) => {
        const job: ExtendedJob = props.cell.row.original
        return (
          <Link
            href={Routes.JobDescriptionPage({
              companySlug: user?.slug,
              jobSlug: props.cell.row.original.slug,
            })}
            passHref
          >
            <div className="bg-gray-50 cursor-pointer w-full rounded overflow-hidden hover:shadow hover:drop-shadow">
              <div className="px-6 py-4">
                <div className="font-bold text-xl text-theme-900 whitespace-normal">
                  {job?.title}
                </div>
                <p className="text-gray-500 text-sm">
                  Posted{" "}
                  {moment(job.createdAt || undefined)
                    .local()
                    .fromNow()}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2 flex flex-wrap">
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  <span>{job?.city},&nbsp;</span>
                  <span>
                    {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name},&nbsp;
                  </span>
                  <span>{Country.getCountryByCode(job?.country!)?.name}</span>
                </span>
                {job?.category && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {job.category?.name}
                  </span>
                )}
                {job?.employmentType && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {titleCase(job.employmentType?.join(" ")?.replaceAll("_", " "))}
                  </span>
                )}
              </div>
            </div>
            {/* <a data-testid={`joblink`} className="text-theme-600 hover:text-theme-900">
              {props.value}
            </a> */}
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
  return (
    <JobApplicationLayout user={user!} isJobBoard={true}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <h3 className="text-2xl font-bold">Careers at {titleCase(user?.companyName)}</h3>
        <div
          className="mt-1 mb-8"
          dangerouslySetInnerHTML={{ __html: draftToHtml(user?.companyInfo || {}) }}
        />
        <Jobs user={user} />
      </Suspense>
    </JobApplicationLayout>
  )
}

export default JobBoard
