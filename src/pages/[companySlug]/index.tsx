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
    return { props: { company } }
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

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="job opening"
      />

      <div>
        {jobs?.map((job) => {
          // Filter jobs whose free candidate limit has reached
          // if (checkSubscription(company) && job.candidates.length >= 25) return <></>

          return (
            <div key={job.id}>
              <div className="bg-white w-full border-2 border-gray-200 hover:border-gray-300 hover:shadow rounded my-4 cursor-pointer px-5 py-3">
                <Link
                  legacyBehavior
                  prefetch={true}
                  href={Routes.JobDescriptionPage({
                    companySlug: company?.slug,
                    jobSlug: job.slug,
                  })}
                  passHref
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="pb-4">
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
                        {job.showSalary && (job.minSalary > 0 || job.maxSalary > 0) && (
                          <p className="text-gray-500 text-sm">
                            {job.currency && getSymbolFromCurrency(job.currency)}
                            {job.minSalary > 0 && job.minSalary}
                            {job.maxSalary > 0 &&
                              ` - ${job.currency && getSymbolFromCurrency(job.currency)}${
                                job.maxSalary
                              }`}
                            {` ${getSalaryIntervalFromSalaryType(job.salaryType)?.toLowerCase()}`}
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
                      {job?.remoteOption !== RemoteOption.No_Remote && (
                        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                          {job?.remoteOption?.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

const CareersPage = ({ company }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
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