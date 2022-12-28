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
import getCareersPageFilters from "src/jobs/queries/getCareersPageFilters"
import JobFilters from "src/jobs/components/JobFilters"
import JobPost from "src/jobs/components/JobPost"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const company = await getCompany(
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context.ctx }
  )

  // const user = await getCurrentUserServer({ ...context })

  if (company) {
    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    return { props: { company, activePlanName } }
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
  company: Company
}
const Jobs = ({ company }: JobsProps) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  // const [query, setQuery] = useState({})
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')

  const { embed } = router.query

  const [theme, setTheme] = useState(company?.theme || "indigo")
  useEffect(() => {
    const themeName = company?.theme || "indigo"
    setTheme(themeName)
  }, [setTheme, company?.theme])

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
  // const [selectedCategoryId, setSelectedCategoryId] = useState(null as string | null)

  const [careersPageFilters] = useQuery(getCareersPageFilters, {
    companyId: (company?.id as string) || "0",
  })

  const [categoryId, setCategoryId] = useState("" as string)
  const [jobType, setJobType] = useState("" as string)
  const [remoteOption, setRemoteOption] = useState("" as string)

  const [jobCountry, setJobCountry] = useState("" as string)
  const [jobState, setJobState] = useState("" as string)
  const [jobCity, setJobCity] = useState("" as string)

  const [searchjobTitle, setSearchJobTitle] = useState("")

  const [{ jobs, hasMore, count }] = usePaginatedQuery(getCompanyJobsForCareersPage, {
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
    companyId: company?.id || "0",
    categoryId,
    jobType,
    jobCountry,
    jobState,
    jobCity,
    remoteOption,
    searchString,
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
    <div className={`theme-${theme} h-fit`}>
      <div className="flex items-center justify-center">
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

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="job opening"
      />

      <div className="w-full flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5 mb-4">
        {/* <div>
          <div className="flex flex-col space-y-5">
            <div className="w-full">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                }}
                className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
              >
                <option value="">All categories</option>
                {careersPageFilters?.categories?.map((category) => {
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
                className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
              >
                <option value="">All types</option>
                {careersPageFilters?.jobTypes?.map((jobType) => {
                  return <option value={jobType}>{titleCase(jobType?.replaceAll("_", " "))}</option>
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
                className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
              >
                <option value="">All locations</option>
                {careersPageFilters?.jobLocations?.map((location) => {
                  const countryStateCity = location?.split(",")

                  return countryStateCity?.length === 3 ? (
                    <option value={location}>
                      {countryStateCity[0]}
                      {countryStateCity[0] && (countryStateCity[1] || countryStateCity[2]) && ", "}

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
                className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
              >
                <option value="">All Remote Options</option>
                {careersPageFilters?.remoteOptions?.map((remoteOption) => {
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
        </div> */}
        <JobFilters
          categoryId={categoryId}
          filters={careersPageFilters}
          isJobBoard={false}
          jobType={jobType}
          remoteOption={remoteOption}
          setCategoryId={setCategoryId}
          setJobCity={setJobCity}
          setJobCountry={setJobCountry}
          setJobState={setJobState}
          setJobType={setJobType}
          setRemoteOption={setRemoteOption}
          setSearchJobTitle={setSearchJobTitle}
          setSearchString={setSearchString}
        />
        <div
          className={`w-full flex flex-col space-y-5 ${
            jobs?.length === 0 ? "border border-neutral-300 rounded p-2" : ""
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
                <JobPost
                  key={job?.id}
                  job={job}
                  embed={embed}
                  companySlug={company?.slug}
                  isJobBoard={false}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}

const CareersPage = ({
  company,
  activePlanName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const { embed } = router.query

  return embed ? (
    <div className="p-1">
      <Jobs company={company!} />
    </div>
  ) : (
    <JobApplicationLayout company={company} isCareersPage={true}>
      <Suspense fallback="Loading...">
        <h3 className="text-2xl font-bold">Careers at {titleCase(company?.name)}</h3>
        <div
          className="quill-container-output mt-1 mb-8"
          dangerouslySetInnerHTML={{
            __html: (company?.info || "") as string,
          }}
        />
        {/* <div
          className="mt-1 mb-8"
          dangerouslySetInnerHTML={{ __html: draftToHtml(company?.info || {}) }}
        /> */}
        <Jobs company={company!} />
      </Suspense>
    </JobApplicationLayout>
  )
}

export default CareersPage
