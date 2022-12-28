import { gSSP } from "src/blitz-server"
import Link from "next/link"
import Image from "next/image"
import { usePaginatedQuery, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, useMemo, Suspense } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import Table from "src/core/components/Table"

import getUser from "src/users/queries/getUser"
import SingleFileUploadField from "src/core/components/SingleFileUploadField"
import {
  AttachmentObject,
  CardType,
  DragDirection,
  ExtendedJob,
  Plan,
  PlanName,
  SubscriptionStatus,
} from "types"
import { titleCase } from "src/core/utils/titleCase"
import draftToHtml from "draftjs-to-html"
import { Country, State } from "country-state-city"
import moment from "moment"
import JobApplicationLayout from "src/core/layouts/JobApplicationLayout"
import Cards from "src/core/components/Cards"
import Card from "src/core/components/Card"
import Pagination from "src/core/components/Pagination"
import Debouncer from "src/core/utils/debouncer"
import getSymbolFromCurrency from "currency-symbol-map"
import getCompany from "src/companies/queries/getCompany"
import { Company, CompanyUser, Job, JobUser, RemoteOption, User } from "@prisma/client"
import { checkPlan } from "src/companies/utils/checkPlan"
import getCompanyJobsForCareersPage from "src/jobs/queries/getCompanyJobsForCareersPage"
import getCompanyJobCategoriesForFilter from "src/categories/queries/getCompanyJobCategoriesForFilter"
import getSalaryIntervalFromSalaryType from "src/jobs/utils/getSalaryIntervalFromSalaryType"
import Stripe from "stripe"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT, FREE_JOBS_LIMIT } from "src/plans/constants"
import getUserOwnedCompanyJobs from "src/jobs/queries/getUserOwnedCompanyJobs"
import getAllUserOwnedCompanies from "src/companies/queries/getAllUserOwnedCompanies"
import getJobBoardFilters from "src/jobs/queries/getJobBoardFilters"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const companies = await getAllUserOwnedCompanies(
    { userId: context?.params?.userId as string },
    { ...context.ctx }
  )

  // const user = await getCurrentUserServer({ ...context })

  if (companies) {
    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    return { props: { companies, activePlanName } }
  } else {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
      props: {},
    }
  }
})

type JobsProps = {
  companies: Company[]
}
const Jobs = ({ companies }: JobsProps) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  // const [query, setQuery] = useState({})
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')

  const { embed, userId } = router.query

  // const [theme, setTheme] = useState(company?.theme || "indigo")
  // useEffect(() => {
  //   const themeName = company?.theme || "indigo"
  //   setTheme(themeName)
  // }, [setTheme, company?.theme])

  useEffect(() => {
    setSearchString((router.query.search as string) || '""')
  }, [router.query])

  // const todayDate = new Date(new Date().toDateString())
  // const [utcDateNow, setUTCDateNow] = useState(null as any)
  // useEffect(() => {
  //   setUTCDateNow(moment().utc().toDate())
  // }, [])
  // const validThrough = utcDateNow ? { gte: utcDateNow } : todayDate

  // const [categories] = useQuery(getCompanyJobCategoriesForFilter, {
  //   searchString,
  //   companyId: company?.id,
  // })

  const [companyId, setCompanyId] = useState("" as string)
  const [categoryId, setCategoryId] = useState("" as string)
  const [jobType, setJobType] = useState("" as string)
  const [remoteOption, setRemoteOption] = useState("" as string)

  const [jobCountry, setJobCountry] = useState("" as string)
  const [jobState, setJobState] = useState("" as string)
  const [jobCity, setJobCity] = useState("" as string)

  const [searchjobTitle, setSearchJobTitle] = useState("")

  const [jobBoardFilters] = useQuery(getJobBoardFilters, { userId: (userId as string) || "0" })

  const [{ jobs, hasMore, count }] = usePaginatedQuery(getUserOwnedCompanyJobs, {
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
    companyId,
    categoryId,
    jobType,
    jobCountry,
    jobState,
    jobCity,
    remoteOption,
    searchString,
    userId: (userId as string) || "0",
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
    <div className={`h-fit`}>
      <div className="mt-8 flex items-center justify-center">
        <input
          placeholder="Search job title"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 w-full md:w-80 px-2 py-2 rounded`}
          value={searchjobTitle}
          onChange={(e) => {
            setSearchJobTitle(e.target.value)
            execDebouncer(e)
          }}
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full lg:w-3/4">
          <Pagination
            endPage={endPage}
            hasNext={hasMore}
            hasPrevious={tablePage !== 0}
            pageIndex={tablePage}
            startPage={startPage}
            totalCount={count}
            resultName="job opening"
          />
        </div>
        <div className="w-full lg:w-3/4 flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
          <div>
            <div className="flex flex-col space-y-5">
              <div className="w-full">
                <select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value)
                  }}
                  className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
                >
                  <option value="">All companies</option>
                  {jobBoardFilters?.companies?.map((company) => {
                    return <option value={company?.id}>{company?.name}</option>
                  })}
                </select>
              </div>

              <div className="w-full">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                  }}
                  className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
                >
                  <option value="">All categories</option>
                  {jobBoardFilters?.categories?.map((category) => {
                    return <option value={category?.id}>{category?.name}</option>
                  })}
                </select>
              </div>

              <div className="w-full">
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value)
                  }}
                  className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
                >
                  <option value="">All types</option>
                  {jobBoardFilters?.jobTypes?.map((jobType) => {
                    return (
                      <option value={jobType}>{titleCase(jobType?.replaceAll("_", " "))}</option>
                    )
                  })}
                </select>
              </div>

              <div className="w-full">
                <select
                  onChange={(e) => {
                    const jobLocation = e.target.value

                    if (jobLocation) {
                      const countryStateCity = jobLocation?.split(",")

                      if (countryStateCity?.length === 3) {
                        setJobCity(countryStateCity[0] || "")
                        setJobState(countryStateCity[1] || "")
                        setJobCountry(countryStateCity[2] || "")
                      }
                    } else {
                      setJobCity("")
                      setJobState("")
                      setJobCountry("")
                    }
                  }}
                  className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
                >
                  <option value="">All locations</option>
                  {jobBoardFilters?.jobLocations?.map((location) => {
                    const countryStateCity = location?.split(",")

                    return countryStateCity?.length === 3 ? (
                      <option value={location}>
                        {countryStateCity[0]}
                        {countryStateCity[0] &&
                          (countryStateCity[1] || countryStateCity[2]) &&
                          ", "}

                        {countryStateCity[1] &&
                          countryStateCity[2] &&
                          State.getStateByCodeAndCountry(countryStateCity[1], countryStateCity[2])
                            ?.name}

                        {countryStateCity[1] && countryStateCity[2] && ", "}
                        {countryStateCity[2] && Country.getCountryByCode(countryStateCity[2])?.name}
                      </option>
                    ) : (
                      <option value={location}>{location}</option>
                    )
                  })}
                </select>
              </div>

              <div className="w-full">
                <select
                  value={remoteOption}
                  onChange={(e) => {
                    setRemoteOption(e.target.value)
                  }}
                  className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
                >
                  <option value="">All Remote Options</option>
                  {jobBoardFilters?.remoteOptions?.map((remoteOption) => {
                    return (
                      <option value={remoteOption}>
                        {titleCase(remoteOption?.replaceAll("_", " "))}
                      </option>
                    )
                  })}
                </select>
              </div>

              <button
                className="w-fit text-left text-theme-600 hover:text-theme-800"
                onClick={(e) => {
                  e.preventDefault()

                  setCompanyId("")
                  setCategoryId("")
                  setJobType("")

                  setJobCity("")
                  setJobState("")
                  setJobCountry("")

                  setRemoteOption("")

                  setSearchJobTitle("")
                  setSearchString('""')
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div
            className={`w-full flex flex-col space-y-5 ${
              jobs?.length === 0 ? "border rounded p-2" : ""
            }`}
          >
            {jobs?.length === 0 && (
              <p className="text-neutral-600 w-full h-full flex items-center justify-center">
                No Jobs
              </p>
            )}
            {jobs?.length > 0 &&
              jobs?.map((job) => {
                return (
                  <div key={job.id}>
                    <div className="bg-white w-full border-2 border-gray-200 hover:border-gray-300 hover:shadow rounded cursor-pointer px-5 py-3">
                      <Link
                        legacyBehavior
                        prefetch={true}
                        href={Routes.JobDescriptionPage({
                          companySlug: job?.company?.slug,
                          jobSlug: job.slug,
                        })}
                        passHref
                      >
                        <a
                          className="overflow-hidden"
                          target={embed ? "_blank" : ""}
                          rel="noreferrer"
                        >
                          <div className="flex flex-wrap items-start justify-between">
                            <div className="pb-4">
                              <div className="pb-2">
                                <div className="border border-neutral-300 rounded px-1 text-neutral-500 w-fit">
                                  {job?.company?.name}
                                </div>
                              </div>
                              <div className="font-bold text-xl text-theme-700 whitespace-normal">
                                {job?.title}
                              </div>
                              <p className="text-gray-500 text-sm">
                                Posted{" "}
                                {moment(job.createdAt || undefined)
                                  .local()
                                  .fromNow()}
                                {/* ,{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()
                            .includes("ago")
                            ? "expired"
                            : "expires"}{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()} */}
                              </p>
                            </div>
                            <div className="pt-2 pb-4">
                              {job?.showSalary && (job?.minSalary > 0 || job?.maxSalary > 0) && (
                                <p className="text-gray-500 text-sm">
                                  {job?.currency && getSymbolFromCurrency(job?.currency)}
                                  {job?.minSalary > 0 && job?.minSalary}
                                  {job?.minSalary > 0 && job?.maxSalary > 0 && " - "}
                                  {job?.maxSalary > 0 && job?.maxSalary}
                                  {` ${getSalaryIntervalFromSalaryType(
                                    job?.salaryType
                                  )?.toLowerCase()}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="pt-4 flex flex-wrap">
                            {(job?.city || job?.state || job?.country) && (
                              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                {job?.city && <span>{job?.city},&nbsp;</span>}
                                {job?.state && job?.country && (
                                  <span>
                                    {
                                      State.getStateByCodeAndCountry(job?.state!, job?.country!)
                                        ?.name
                                    }
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
                            {job?.jobType && (
                              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                {titleCase(job.jobType?.replaceAll("_", " "))}
                              </span>
                            )}
                            {job?.remoteOption !== RemoteOption.No_Remote && (
                              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                {job?.remoteOption?.replaceAll("_", " ")}
                              </span>
                            )}
                          </div>
                        </a>
                      </Link>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

const CompanyJobBoard = ({
  companies,
  activePlanName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const { embed } = router.query

  return embed ? (
    <div className="p-1">
      <Jobs companies={companies!} />
    </div>
  ) : (
    // <JobApplicationLayout company={company} isCareersPage={true}>
    <div className="flex flex-col min-h-screen p-10">
      <h3 className="text-2xl font-bold text-center top-0">Job Board</h3>

      <div className="mb-auto">
        <Suspense fallback="Loading...">
          {/* <div
        className="quill-container-output mt-1 mb-8"
        dangerouslySetInnerHTML={{
          __html: (company?.info || "") as string,
        }}
      /> */}
          {/* <div
          className="mt-1 mb-8"
          dangerouslySetInnerHTML={{ __html: draftToHtml(company?.info || {}) }}
        /> */}
          <Jobs companies={companies!} />
        </Suspense>
      </div>

      <div className="w-full flex items-center justify-center mt-10">
        <Link href={Routes.Home()} legacyBehavior passHref>
          <a
            target="_blank"
            rel="noreferrer"
            className="border rounded-lg px-4 py-2 hover:bg-neutral-50"
          >
            Powered by hire.win
          </a>
        </Link>
      </div>
    </div>
    // </JobApplicationLayout>
  )
}

export default CompanyJobBoard
