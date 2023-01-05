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
import getCompanyJobsByParentCompany from "src/jobs/queries/getCompanyJobsByParentCompany"
import getAllUserOwnedCompanies from "src/companies/queries/getAllUserOwnedCompanies"
import getJobBoardFilters from "src/jobs/queries/getJobBoardFilters"
import JobFilters from "src/jobs/components/JobFilters"
import JobPost from "src/jobs/components/JobPost"
import db from "db"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  // const user = await getCurrentUserServer({ ...context })

  // const user = await getUser(
  //   {
  //     where: { id: (context?.params?.userId as string) || "0" },
  //   },
  //   context.ctx
  // )

  const parentCompanyId = context?.params?.parentCompanyId as string
  const parentCompany = await db.parentCompany.findFirst({
    where: { id: parentCompanyId },
  })

  if (parentCompany) {
    return { props: { parentCompanyName: parentCompany?.name } }
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

const Jobs = ({}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  // const [query, setQuery] = useState({})
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')

  const { embed, parentCompanyId } = router.query

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

  const [jobBoardFilters] = useQuery(getJobBoardFilters, {
    parentCompanyId: (parentCompanyId as string) || "0",
  })

  const [{ jobs, hasMore, count }] = usePaginatedQuery(getCompanyJobsByParentCompany, {
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
    parentCompanyId: (parentCompanyId as string) || "0",
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
        <div className="mb-4 w-full lg:w-3/4 flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-5">
          <JobFilters
            filters={jobBoardFilters}
            companyId={companyId}
            categoryId={categoryId}
            isJobBoard={true}
            jobType={jobType}
            remoteOption={remoteOption}
            setCompanyId={setCompanyId}
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
                  <JobPost
                    key={job?.id}
                    job={job}
                    embed={embed}
                    companySlug={job?.company?.slug}
                    isJobBoard={true}
                  />
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

const ParentCompanyJobBoard = ({
  parentCompanyName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const { embed } = router.query

  return embed ? (
    <div className="p-1">
      <Jobs />
    </div>
  ) : (
    <div className="flex flex-col min-h-screen p-10">
      <h3 className="text-2xl font-bold text-center top-0">{parentCompanyName || ""} Job Board</h3>

      <div className="mb-auto">
        <Suspense fallback="Loading...">
          <Jobs />
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
  )
}

export default ParentCompanyJobBoard
