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
  useQuery,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getUser from "app/users/queries/getUser"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { AttachmentObject, CardType, DragDirection, ExtendedJob } from "types"
import { titleCase } from "app/core/utils/titleCase"
import draftToHtml from "draftjs-to-html"
import { Country, State } from "country-state-city"
import moment from "moment"
import JobApplicationLayout from "app/core/layouts/JobApplicationLayout"
import Cards from "app/core/components/Cards"
import Card from "app/core/components/Card"
import Pagination from "app/core/components/Pagination"
import Debouncer from "app/core/utils/debouncer"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"

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
  const [query, setQuery] = useState({})
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: user?.id } })
  const [selectedCategoryId, setSelectedCategoryId] = useState("0")

  const [{ memberships, hasMore, count }] = usePaginatedQuery(getJobs, {
    where:
      selectedCategoryId !== "0"
        ? {
            userId: user?.id,
            job: { categoryId: selectedCategoryId, hidden: false },
            ...query,
          }
        : {
            userId: user?.id,
            job: { hidden: false },
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

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
        ...searchQuery,
      },
    })
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e) => {
    e.persist()
    return debouncer.execute(e)
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />

        <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
          {categories?.length > 0 && (
            <div
              className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
                selectedCategoryId === "0"
                  ? "bg-theme-700 cursor-default"
                  : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
              }`}
              onClick={() => {
                setSelectedCategoryId("0")
              }}
            >
              All
            </div>
          )}
          {categories
            ?.filter((c) => c.jobs.length > 0)
            ?.map((category) => {
              return (
                <div
                  key={category.id}
                  className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
                    selectedCategoryId === category.id
                      ? "bg-theme-700 cursor-default"
                      : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
                  }`}
                  onClick={async () => {
                    setSelectedCategoryId(category.id)
                    await invalidateQuery(getJobs)
                  }}
                >
                  {category.name}
                </div>
              )
            })}
        </div>
      </div>

      <div>
        {memberships
          .map((membership) => {
            return {
              ...membership.job,
              canUpdate: membership.role === "OWNER" || membership.role === "ADMIN",
            }
          })
          ?.map((job) => {
            return (
              <>
                <Card key={job.id} isFull={true}>
                  <Link
                    href={Routes.JobDescriptionPage({
                      companySlug: user?.slug,
                      jobSlug: job.slug,
                    })}
                    passHref
                  >
                    <div className="bg-gray-50 cursor-pointer w-full rounded overflow-hidden hover:shadow hover:drop-shadow">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl text-theme-700 whitespace-normal">
                          {job?.title}
                        </div>
                        <p className="text-gray-500 text-sm">
                          Posted{" "}
                          {moment(job.createdAt || undefined)
                            .local()
                            .fromNow()}
                          ,{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()
                            .includes("ago")
                            ? "expired"
                            : "expires"}{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()}
                        </p>
                      </div>
                      <div className="px-6 pt-4 pb-2 flex flex-wrap">
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                          <span>{job?.city},&nbsp;</span>
                          <span>
                            {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name}
                            ,&nbsp;
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
                        {job?.remote && (
                          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                            {job?.remote && "Remote"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </Card>
              </>
            )
          })}
      </div>

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="job"
      />
    </>
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
