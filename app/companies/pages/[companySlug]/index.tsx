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
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getUser from "app/users/queries/getUser"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { AttachmentObject, CardType, DragDirection, ExtendedJob, Plan } from "types"
import { titleCase } from "app/core/utils/titleCase"
import draftToHtml from "draftjs-to-html"
import { Country, State } from "country-state-city"
import moment from "moment"
import JobApplicationLayout from "app/core/layouts/JobApplicationLayout"
import Cards from "app/core/components/Cards"
import Card from "app/core/components/Card"
import Pagination from "app/core/components/Pagination"
import Debouncer from "app/core/utils/debouncer"
import getSymbolFromCurrency from "currency-symbol-map"
import getCompany from "app/companies/queries/getCompany"
import { Company, CompanyUser, Job, JobUser, User } from "@prisma/client"
import { checkPlan } from "app/users/utils/checkPlan"
import getCompanyJobsForCareersPage from "app/jobs/queries/getCompanyJobsForCareersPage"
import getCompanyJobCategoriesForFilter from "app/categories/queries/getCompanyJobCategoriesForFilter"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const company = await invokeWithMiddleware(
    getCompany,
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context }
  )

  // const user = await getCurrentUserServer({ ...context })

  if (company) {
    const currentPlan = checkPlan(company)
    return { props: { company, currentPlan } }
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

type JobsProps = {
  company: Company
  currentPlan: Plan | null | undefined
}
const Jobs = ({ company, currentPlan }: JobsProps) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  // const [query, setQuery] = useState({})
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')

  useEffect(() => {
    setSearchString((router.query.search as string) || '""')
  }, [router.query])

  // const todayDate = new Date(new Date().toDateString())
  // const [utcDateNow, setUTCDateNow] = useState(null as any)
  // useEffect(() => {
  //   setUTCDateNow(moment().utc().toDate())
  // }, [])
  // const validThrough = utcDateNow ? { gte: utcDateNow } : todayDate

  const [categories] = useQuery(getCompanyJobCategoriesForFilter, {
    searchString,
    companyId: company?.id,
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState(null as string | null)

  const [{ jobs, hasMore, count }] = usePaginatedQuery(getCompanyJobsForCareersPage, {
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
    categoryId: selectedCategoryId,
    searchString,
    companyId: company?.id,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  // useEffect(() => {
  //   const search = router.query.search
  //     ? {
  //         AND: {
  //           job: {
  //             title: {
  //               contains: JSON.parse(router.query.search as string),
  //               mode: "insensitive",
  //             },
  //           },
  //         },
  //       }
  //     : {}

  //   setQuery(search)
  // }, [router.query])

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
      <div className="flex items-center justify-center mb-4">
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
          {jobs?.length > 0 && (
            <>
              {categories?.filter((c) => c.jobs.find((j) => !j.archived))?.length > 0 && (
                <div
                  className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
                    selectedCategoryId === null
                      ? "bg-theme-700 cursor-default"
                      : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
                  }`}
                  onClick={() => {
                    setSelectedCategoryId(null)
                  }}
                >
                  All
                </div>
              )}
              {categories
                ?.filter((c) => c.jobs.find((j) => !j.archived))
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
                        await invalidateQuery(getCompanyJobsForCareersPage)
                      }}
                    >
                      {category.name}
                    </div>
                  )
                })}
              {/* {categories
                ?.filter((c) => c.jobs.length > 0)
                ?.filter((c) => !c.jobs?.some((j) => !currentPlan && j._count.candidates >= 25)) // Filter jobs whose free candidate limit has reached
                ?.length > 0 && (
                <div
                  className={`capitalize whitespace-nowrap text-white px-2 py-1 border-2 border-neutral-300 ${
                    selectedCategoryId === "0"
                      ? "bg-theme-700 cursor-default"
                      : "bg-theme-500 hover:bg-theme-600 cursor-pointer"
                  }`}
                  onClick={() => {
                    setSelectedCategoryId(null)
                  }}
                >
                  All
                </div>
              )}
              {categories
                ?.filter((c) => c.jobs.length > 0)
                ?.filter((c) => !c.jobs?.some((j) => !currentPlan && j._count.candidates >= 25)) // Filter jobs whose free candidate limit has reached
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
                })} */}
            </>
          )}
        </div>
      </div>

      <div>
        {jobs?.map((job) => {
          // Filter jobs whose free candidate limit has reached
          if (!currentPlan && job.candidates.length >= 25) return <></>

          return (
            <div key={job.id}>
              <Card isFull={true}>
                <Link
                  href={Routes.JobDescriptionPage({
                    companySlug: company?.slug,
                    jobSlug: job.slug,
                  })}
                  passHref
                >
                  <div className="bg-gray-50 cursor-pointer w-full rounded overflow-hidden hover:shadow hover:drop-shadow">
                    <div className="flex flex-wrap items-center justify-between">
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
                      <div className="px-6 py-4">
                        {job.showSalary && (
                          <p className="text-gray-500 text-sm">
                            {getSymbolFromCurrency(job.currency)}
                            {job.minSalary} - {getSymbolFromCurrency(job.currency)}
                            {job.maxSalary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pt-4 pb-2 flex flex-wrap">
                      {(job?.city || job?.state || job?.country) && (
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                          {job?.city && <span>{job?.city},&nbsp;</span>}
                          {job?.state && job?.country && (
                            <span>
                              {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name}
                              ,&nbsp;
                            </span>
                          )}
                          {job?.country && (
                            <span>{Country.getCountryByCode(job?.country!)?.name}</span>
                          )}
                        </span>
                      )}
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
            </div>
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

const CareersPage = ({
  company,
  currentPlan,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <JobApplicationLayout company={company} isCareersPage={true}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <h3 className="text-2xl font-bold">Careers at {titleCase(company?.name)}</h3>
        <div
          className="mt-1 mb-8"
          dangerouslySetInnerHTML={{ __html: draftToHtml(company?.info || {}) }}
        />
        <Jobs company={company!} currentPlan={currentPlan} />
      </Suspense>
    </JobApplicationLayout>
  )
}

export default CareersPage
