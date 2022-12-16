import { gSSP } from "src/blitz-server"
import dynamic from "next/dynamic"
import Link from "next/link"

import { getSession, useSession } from "@blitzjs/auth"

import { usePaginatedQuery, useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, Suspense, Fragment } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import Table from "src/core/components/Table"

import Guard from "src/guard/ability"
import Confirm from "src/core/components/Confirm"
import {
  CardType,
  DragDirection,
  ExtendedJob,
  IntroHint,
  IntroStep,
  JobViewType,
  Plan,
  PlanName,
  SubscriptionStatus,
} from "types"
import { Candidate, Category, CompanyUserRole, RemoteOption, Stage } from "@prisma/client"
import moment from "moment"
import { Country, State } from "country-state-city"
import { titleCase } from "src/core/utils/titleCase"
import Form from "src/core/components/Form"
import LabeledToggleSwitch from "src/core/components/LabeledToggleSwitch"
import setJobHidden from "src/jobs/mutations/setJobHidden"
import toast from "react-hot-toast"
import Cards from "src/core/components/Cards"
import {
  ArchiveIcon,
  CogIcon,
  DotsVerticalIcon,
  ExclamationCircleIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
} from "@heroicons/react/outline"
import getCategories from "src/categories/queries/getCategories"
import Card from "src/core/components/Card"
import Pagination from "src/core/components/Pagination"
import Debouncer from "src/core/utils/debouncer"
import setJobSalaryVisibility from "src/jobs/mutations/setJobSalaryVisibility"
import getCompany from "src/companies/queries/getCompany"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { loadStripe } from "@stripe/stripe-js"
import createStripeCheckoutSession from "src/companies/mutations/createStripeCheckoutSession"
import createStripeBillingPortal from "src/companies/mutations/createStripeBillingPortal"
import updateJob from "src/jobs/mutations/updateJob"
import setJobArchived from "src/jobs/mutations/setJobArchived"
import RadioGroupField from "src/core/components/RadioGroupField"
import getUserJobsByViewTypeAndCategory from "src/jobs/queries/getUserJobsByViewTypeAndCategory"
import getUserJobCategoriesByViewType from "src/categories/queries/getUserJobCategoriesByViewType"
import { StepsProps } from "intro.js-react"
import usePreviousValue from "src/core/hooks/usePreviousValue"
import { jobs } from "googleapis/build/src/apis/jobs"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import Modal from "src/core/components/Modal"
import LabeledTextField from "src/core/components/LabeledTextField"
import getJobs from "src/jobs/queries/getJobs"
import createJobWithTitle from "src/jobs/mutations/createJobWithTitle"
import { Menu, Transition } from "@headlessui/react"
import classNames from "src/core/utils/classNames"
import ViewCareersPageButton from "src/companies/components/ViewCareersPageButton"
import getFirstWordIfLessThan from "src/core/utils/getFirstWordIfLessThan"
import SignupWelcome from "src/auth/components/SignupWelcome"
import CouponRedeemedWelcome from "src/coupons/components/CouponRedeemedWelcome"
import getFirstWord from "src/core/utils/getFirstWordIfLessThan"
import InvalidCouponMessage from "src/coupons/components/InvalidCouponMessage"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  // const session = await getSession(context.req, context.res)
  const session = context.ctx.session

  let companyUser = await getCompanyUser(
    {
      where: {
        companyId: session.companyId || "0",
        userId: session.userId || "0",
      },
    },
    { ...context.ctx }
  )

  const companyUsers = await getCompanyUsers(
    {
      where: {
        // companyId: session.companyId || "0",
        userId: context.ctx.session.userId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && !companyUser) {
    if (companyUsers && companyUsers.length > 0) {
      await session.$setPublicData({ companyId: companyUsers[0]?.companyId || "0" })
      companyUser = await getCompanyUser(
        {
          where: {
            companyId: session.companyId || "0",
            userId: session.userId || "0",
          },
        },
        { ...context.ctx }
      )
    } else {
      return {
        redirect: {
          destination: Routes.FirstCompany().pathname,
          permanent: false,
        },
        props: {},
      }
    }
  }

  if (user && companyUser) {
    const { can: canCreate } = await Guard.can("create", "job", { ...context.ctx }, {})

    return {
      props: {
        user,
        companyUserRole: companyUser.role,
        company: companyUser.company,
        companyUsersLength: companyUsers?.length || 0,
        canCreate,
      } as any,
    }
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

const CategoryFilterButtons = ({
  selectedCategoryId,
  setSelectedCategoryId,
  viewType,
  searchString,
}) => {
  const [categories] = useQuery(getUserJobCategoriesByViewType, {
    viewType,
    searchString,
  })

  return (
    <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
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
      {categories?.map((category) => {
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
              await invalidateQuery(getUserJobsByViewTypeAndCategory)
            }}
          >
            {category.name}
          </div>
        )
      })}
    </div>
  )
}

const Jobs = ({
  user,
  company,
  // subscription,
  setOpenConfirm,
  setConfirmMessage,
  viewType,
  introSteps,
  introStepsEnabled,
  isIntroFirstLoad,
  setIsIntroFirstLoad,
  Steps,
  companyUsersLength,
}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const session = useSession()
  const tablePage = Number(router.query.page) || 0
  // const [data, setData] = useState<{}[]>([])
  const [searchString, setSearchString] = useState((router.query.search as string) || '""')
  // const [query, setQuery] = useState({})

  useEffect(() => {
    setSearchString((router.query.search as string) || '""')
  }, [router.query])

  // const todayDate = new Date(new Date().toDateString())
  // const [utcDateNow, setUTCDateNow] = useState(null as any)
  // useEffect(() => {
  //   setUTCDateNow(moment().utc().toDate())
  // }, [viewType])
  // const validThrough = utcDateNow
  //   ? viewType === JobViewType.Expired
  //     ? { lt: utcDateNow }
  //     : { gte: utcDateNow }
  //   : todayDate

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

  const [selectedCategoryId, setSelectedCategoryId] = useState(null as string | null)

  const [{ jobUsers, hasMore, count }] = usePaginatedQuery(getUserJobsByViewTypeAndCategory, {
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
    searchString,
    viewType,
    categoryId: selectedCategoryId,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  const [setJobHiddenMutation] = useMutation(setJobHidden)
  const [setJobArchivedMutation] = useMutation(setJobArchived)
  const [setJobSalaryVisibilityMutation] = useMutation(setJobSalaryVisibility)

  const [openJobArchiveConfirm, setOpenJobArchiveConfirm] = useState(false)
  const [jobToArchive, setJobToArchive] = useState(null as any)

  useEffect(() => {
    invalidateQuery(getUserJobCategoriesByViewType)
    invalidateQuery(getUserJobsByViewTypeAndCategory)
  }, [viewType])

  function PopMenu({ job }) {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center text-theme-600 hover:text-gray-800 outline-none">
            <DotsVerticalIcon className="h-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm cursor-pointer"
                      )}
                      onClick={async (e) => {
                        e.preventDefault()
                        const toastId = toast.loading(() => (
                          <span>
                            <b>
                              {job.hidden ? "Showing" : "Hiding"} job {job?.title}{" "}
                              {job.hidden ? "on" : "from"} Careers Page
                            </b>
                          </span>
                        ))

                        try {
                          await setJobHiddenMutation({
                            where: {
                              id: job?.id,
                            },
                            hidden: !job.hidden,
                          })

                          invalidateQuery(getUserJobsByViewTypeAndCategory)

                          toast.success(
                            () => (
                              <span>
                                <b>
                                  {job?.title} job is now{" "}
                                  {job.hidden ? "showing on" : "hidden from"} careers page
                                </b>
                              </span>
                            ),
                            { id: toastId }
                          )
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString(),
                            {
                              id: toastId,
                            }
                          )
                        }
                      }}
                    >
                      {job?.hidden ? (
                        <span className="flex items-center space-x-2">
                          <EyeIcon className="w-5 h-5 text-theme-600" />
                          <span className="whitespace-nowrap">Show on Careers Page</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <EyeOffIcon className="w-5 h-5 text-red-600" />
                          <span className="whitespace-nowrap">Hide from Careers Page</span>
                        </span>
                      )}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setJobToArchive(job)
                        setOpenJobArchiveConfirm(true)
                      }}
                    >
                      {job?.archived ? (
                        <span className="flex items-center space-x-2 whitespace-nowrap">
                          <RefreshIcon className="w-5 h-5 text-theme-600" />
                          <span>Restore Job</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <ArchiveIcon className="w-5 h-5 text-red-600" />
                          <span>Archive Job</span>
                        </span>
                      )}
                    </a>
                  )}
                </Menu.Item>
              </div>
            }
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

  return (
    <>
      {Steps &&
        companyUsersLength === 1 &&
        jobUsers?.length === 0 &&
        introStepsEnabled &&
        isIntroFirstLoad && (
          <Steps
            enabled={introStepsEnabled || false}
            steps={introSteps}
            initialStep={0}
            options={{
              nextToDone: true,
              dontShowAgain: true,
              dontShowAgainLabel: "Don't show again",
            }}
            onExit={() => {
              if (isIntroFirstLoad) {
                setIsIntroFirstLoad(false)
              }
            }}
          />
        )}
      {/* {Hints && introHintsEnabled && isIntroFirstLoad && (
        <Hints enabled={introHintsEnabled || false} hints={introHints} />
      )} */}

      <Confirm
        open={openJobArchiveConfirm}
        setOpen={setOpenJobArchiveConfirm}
        header={`${viewType === JobViewType.Archived ? "Restore" : "Archive"} Job - ${
          jobToArchive?.title
        }`}
        onSuccess={async () => {
          const toastId = toast.loading(
            `${viewType === JobViewType.Archived ? "Restoring" : "Archiving"} Job`
          )
          try {
            await setJobArchivedMutation({
              where: { id: jobToArchive?.id },
              archived: !jobToArchive?.archived,
            })
            toast.success(`Job ${viewType === JobViewType.Archived ? "Restored" : "Archived"}`, {
              id: toastId,
            })
            setSelectedCategoryId(null)
            invalidateQuery(getUserJobsByViewTypeAndCategory)
            invalidateQuery(getUserJobCategoriesByViewType)
          } catch (error) {
            toast.error(
              `${
                viewType === JobViewType.Archived ? "Restoring" : "Archiving"
              } job failed - ${error.toString()}`,
              { id: toastId }
            )
          }
          setJobToArchive(null as any)
          setOpenJobArchiveConfirm(false)
        }}
      >
        Are you sure you want to {viewType === JobViewType.Archived ? "Restore" : "Archive"} the
        job?
      </Confirm>

      {jobUsers?.length > 0 && (
        <Pagination
          endPage={endPage}
          hasNext={hasMore}
          hasPrevious={tablePage !== 0}
          pageIndex={tablePage}
          startPage={startPage}
          totalCount={count}
          resultName="job"
        />
      )}

      {!jobUsers ||
        (jobUsers?.length === 0 && (
          <div className="mt-10 w-full border-2 rounded-xl border-neutral-400 py-10 flex flex-col items-center justify-center space-y-5 text-neutral-700">
            <p>No Jobs</p>
          </div>
        ))}

      {jobUsers?.length > 0 && (
        <Suspense
          fallback={
            <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
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
            </div>
          }
        >
          <CategoryFilterButtons
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            viewType={viewType}
            searchString={searchString}
          />
        </Suspense>
      )}

      <div className="space-y-5 mt-5">
        {jobUsers
          .map((jobUser) => {
            return {
              ...jobUser.job,
              hasByPassedPlanLimit: false,
              // hasByPassedPlanLimit:
              //   !(
              //     subscription?.status === SubscriptionStatus.ACTIVE ||
              //     subscription?.status === SubscriptionStatus.TRIALING
              //   ) && jobUsers?.length > 1,
              canUpdate: jobUser.role === "OWNER" || jobUser.role === "ADMIN",
            }
          })
          ?.map((job) => {
            const stages: Stage[] =
              job?.stages?.sort((a, b) => {
                return a?.order - b?.order
              }) || []

            return (
              <div key={job.id}>
                <Card isFull={true}>
                  <div className="bg-white w-full rounded px-3 py-1">
                    <div className="flex items-center justify-between pb-4 md:pb-0">
                      <div>
                        <div className="font-bold text-xl text-theme-900 whitespace-normal">
                          <a
                            data-testid={`joblink`}
                            className="cursor-pointer text-theme-600 hover:text-theme-800"
                            onClick={(e) => {
                              e.preventDefault()
                              if (job.hasByPassedPlanLimit) {
                                setConfirmMessage(
                                  "Upgrade to the Pro Plan to view this job since you've bypassed the 1 job limit on Free plan."
                                )
                                setOpenConfirm(true)
                              } else {
                                router.push(Routes.SingleJobPage({ slug: job.slug }))
                              }
                            }}
                          >
                            {job?.title}
                          </a>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Created{" "}
                          {moment(job.createdAt || undefined)
                            .local()
                            .fromNow()}{" "}
                          by{" "}
                          {session?.userId === job?.createdById
                            ? "you"
                            : getFirstWordIfLessThan(job?.createdBy?.name || "...", 10)}
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
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-center justify-center">
                        <a
                          title="Job Settings"
                          className="cursor-pointer text-theme-600 hover:text-theme-800"
                          onClick={(e) => {
                            e.preventDefault()
                            if (job.hasByPassedPlanLimit) {
                              setConfirmMessage(
                                "Upgrade to the Pro Plan to update this job since you've bypassed the 1 job limit on Free plan."
                              )
                              setOpenConfirm(true)
                            } else {
                              job.canUpdate
                                ? router.push(Routes.JobSettingsPage({ slug: job.slug }))
                                : router.push(Routes.JobSettingsSchedulingPage({ slug: job.slug }))
                            }
                          }}
                        >
                          <CogIcon className="h-6 w-6" />
                        </a>

                        {job.canUpdate && <PopMenu job={job} />}
                      </div>
                    </div>

                    <div className="py-2 md:py-0 lg:py-0 md:pb-4 lg:pb-4">
                      <div className="text-lg text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                        {job?.candidates?.length}{" "}
                        {job?.candidates?.length === 1 ? "candidate" : "candidates"}
                      </div>
                      {/* <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                            {stages?.map((ws) => {
                              return (
                                <div
                                  key={ws.id}
                                  className="p-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 w-32 flex flex-col items-center justify-center"
                                >
                                  <div className="overflow-hidden text-neutral-600">{ws.stage?.name}</div>
                                  <div className="text-neutral-600">
                                    {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
                                  </div>
                                </div>
                              )
                            })}
                          </div> */}
                      <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center">
                        {stages?.map((stage) => {
                          return (
                            <div
                              key={stage.id}
                              className="shadow drop-shadow overflow-auto p-1 m-1 rounded-lg border-2 border-neutral-300 bg-white w-32 flex flex-col items-center justify-center"
                            >
                              <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                                {stage?.name}
                              </div>
                              <div className="text-neutral-500">
                                {job?.candidates?.filter((c) => c.stageId === stage.id)?.length}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap md:items-center md:justify-center lg:items-center lg:justify-center">
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
                </Card>
              </div>
            )
          })}
      </div>
    </>
  )
}

const JobsHome = ({
  user,
  companyUserRole,
  company,
  canCreate,
  companyUsersLength,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(
    "Upgrade to the Pro Plan to create unlimited jobs. You can create only 1 job on the Free plan."
  )
  const [viewType, setViewType] = useState(JobViewType.Active)

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

  // // Redirect user to stripe checkout if trial has ended
  // const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)
  // const manageBilling = useCallback(async () => {
  //   try {
  //     const url = await createStripeBillingPortalMutation({
  //       companyId: company?.id || "0",
  //     })

  //     if (url) window.location.href = url
  //   } catch (err) {
  //     toast.error("Unable to open Manage Billing")
  //   }
  // }, [company?.id, createStripeBillingPortalMutation])
  // const [createStripeSessionMutation] = useMutation(createStripeCheckoutSession)
  // const createSubscription = useCallback(async () => {
  //   if (priceId && priceId !== "0") {
  //     const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC!)
  //     const sessionId = await createStripeSessionMutation({
  //       priceId,
  //       companyId: company?.id || "0",
  //       quantity: 1,
  //     })

  //     sessionId &&
  //       stripe?.redirectToCheckout({
  //         sessionId: sessionId,
  //       })
  //   }
  // }, [company?.id, createStripeSessionMutation, priceId])
  // useEffect(() => {
  //   if (!currentPlan && priceId !== "0") {
  //     createSubscription()
  //     // company?.stripeSubscriptionId ? manageBilling() : createSubscription()
  //   }
  // }, [currentPlan, createSubscription, priceId])

  // if (!currentPlan) {
  //   return <></>
  // }

  const searchInput = (
    <input
      placeholder="Search"
      type="text"
      defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
      className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
      onChange={(e) => {
        execDebouncer(e)
      }}
    />
  )

  // const subscription = checkSubscription(company)
  // const subscriptionLink =
  //   companyUserRole === CompanyUserRole.OWNER ? (
  //     <>
  //       <Link legacyBehavior
  //         prefetch={true}
  //         href={Routes.UserSettingsBillingPage({ companySlug: company?.slug! })}
  //         passHref
  //       >
  //         <a className="flex items-center py-2 whitespace-nowrap">
  //           {subscription?.status === SubscriptionStatus.TRIALING ? (
  //             <span className="text-yellow-600 hover:underline py-1 px-3 border-2 rounded-full border-yellow-500">
  //               Trial ends in {subscription?.daysLeft}{" "}
  //               {subscription?.daysLeft === 1 ? "day" : "days"}
  //             </span>
  //           ) : subscription?.status !== SubscriptionStatus.ACTIVE ? (
  //             <span className="text-red-600 flex items-center hover:underline py-1 px-3 border-2 rounded-full border-red-500">
  //               <ExclamationCircleIcon className="w-4 h-4 mr-1" />
  //               <span>Subscribe Plan</span>
  //             </span>
  //           ) : (
  //             <></>
  //           )}
  //         </a>
  //       </Link>
  //     </>
  //   ) : (
  //     <></>
  //   )

  // const viewCareersPageLink = (
  //   <Link legacyBehavior prefetch={true} href={Routes.CareersPage({ companySlug: company?.slug! })} passHref>
  //     <a
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       className="flex items-center underline text-theme-600 py-2 hover:text-theme-800 whitespace-nowrap"
  //     >
  //       <span>View Careers Page</span>
  //       <ExternalLinkIcon className="w-4 h-4 ml-1" />
  //     </a>
  //   </Link>
  // )

  const [hideConfirmButton, setHideConfirmButton] = useState(false)
  const [cancelButtonText, setCancelButtonText] = useState("Cancel")
  const [confirmHeader, setConfirmHeader] = useState("Upgrade to the Pro Plan?")

  const newJobButton = (
    <button
      className="text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      onClick={(e) => {
        e.preventDefault()
        if (canCreate) {
          // return router.push(Routes.NewJob())
          setOpenModal(true)
        } else {
          if (companyUserRole === CompanyUserRole.USER) {
            setConfirmHeader("No Permission")
            setConfirmMessage("You need admin rights for creating a job")
            setCancelButtonText("Ok")
            setHideConfirmButton(true)
          } else {
            // if (
            //   !(
            //     subscription?.status === SubscriptionStatus.ACTIVE ||
            //     subscription?.status === SubscriptionStatus.TRIALING
            //   )
            // ) {
            //   setConfirmHeader("Upgrade to the Pro Plan?")
            //   setConfirmMessage(
            //     "Upgrade to the Pro Plan to create unlimited jobs. You can create only 1 job on the Free plan."
            //   )
            //   setCancelButtonText("Cancel")
            //   setHideConfirmButton(false)
            // } else {
            setConfirmHeader("No Permission")
            setConfirmMessage("You don't have the permission to create a job")
            setCancelButtonText("Ok")
            setHideConfirmButton(true)
            // }
          }
          setOpenConfirm(true)
        }
      }}
    >
      New Job
    </button>
  )

  const [introStepsEnabled, setIntroStepsEnabled] = useState(false)
  // const [introHintsEnabled, setIntroHintsEnabled] = useState(false)
  const [isIntroFirstLoad, setIsIntroFirstLoad] = useState(true)
  // useEffect(() => {
  //   setTimeout(() => {
  //     setIntroStepsEnabled(true)
  //     // setIntroHintsEnabled(true)
  //   }, 1000)
  // }, [])

  const [introSteps, setIntroSteps] = useState([] as IntroStep[])
  const [introHints, setIntroHints] = useState([] as IntroHint[])
  const setNavbarIntroSteps = (navbarIntroSteps) => {
    setIntroSteps([
      {
        title: "Welcome to hire.win",
        intro: (
          <span>
            <p>
              {`We'll`} walk you through a <b>quick intro</b> so that you better understand the
              application.
            </p>
            <br />
            <p>
              <b>Click on the Next button</b> to proceed or else the close button to Skip
            </p>
          </span>
        ),
      },
      ...navbarIntroSteps,
      {
        title: "That's it for now",
        intro: (
          <span>
            <p>
              {`You'll`} better understand the application once you <b>start using it</b>.
            </p>
            <br />
            <p>
              Feel free to reach out to us in case of any queries and {`we'll`} be happy to help 😊
            </p>
            <br />
            <p>
              Write us to <b>support@hire.win</b>
            </p>
          </span>
        ),
      },
    ])
  }
  const setNavbarIntroHints = (navbarIntroHints) => {
    setIntroHints(navbarIntroHints)
  }

  const Steps = dynamic(() => import("intro.js-react").then((mod) => mod.Steps), {
    ssr: false,
  }) as any
  // const Hints = dynamic(() => import("intro.js-react").then((mod) => mod.Hints), {
  //   ssr: false,
  // }) as any

  const [openModal, setOpenModal] = useState(false)
  const [createJobWithTitleMutation] = useMutation(createJobWithTitle)

  // used useEffect for setting openWelcomeModal to avoid Hydration error
  const [openWelcomeModal, setOpenWelcomeModal] = useState(false)
  useEffect(() => {
    setOpenWelcomeModal(user?.isFirstSignup || false)
  }, [])

  // used useEffect for setting couponRedeemed to avoid Hydration error
  const [couponRedeemed, setCouponRedeemed] = useState(false)
  useEffect(() => {
    setCouponRedeemed(router.query.couponRedeemed ? true : false)
  }, [])

  // used useEffect for setting invalidCoupon to avoid Hydration error
  const [invalidCoupon, setInvalidCoupon] = useState(false)
  useEffect(() => {
    setInvalidCoupon(router.query.invalidCoupon ? true : false)
  }, [])

  return (
    <AuthLayout
      title="Hire.win | Jobs"
      user={user}
      setNavbarIntroSteps={setNavbarIntroSteps}
      setNavbarIntroHints={setNavbarIntroHints}
    >
      {invalidCoupon && (
        <InvalidCouponMessage userName={user?.name || ""} setInvalidCoupon={setInvalidCoupon} />
      )}

      {couponRedeemed && (
        <CouponRedeemedWelcome
          setCouponRedeemed={setCouponRedeemed}
          userName={user?.name || ""}
          userId={user?.id}
        />
      )}

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={confirmHeader}
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
        hideConfirm={hideConfirmButton}
        cancelText={cancelButtonText}
      >
        {confirmMessage}
      </Confirm>

      <Modal header="New Job" open={openModal} setOpen={setOpenModal}>
        <Form
          header={`New Job`}
          subHeader=""
          submitText="Create"
          onSubmit={async (values) => {
            const toastId = toast.loading("Creating Job")
            try {
              // values["validThrough"] = new Date(moment().add(1, "months").toISOString())
              const job = await createJobWithTitleMutation({
                ...values,
              })
              router.push(Routes.JobSettingsPage({ slug: job.slug }))
              invalidateQuery(getUserJobsByViewTypeAndCategory)
              invalidateQuery(getUserJobCategoriesByViewType)
              toast.success("Job created successfully", { id: toastId })
            } catch (error) {
              toast.error(`Failed to create new job - ${error.toString()}`, { id: toastId })
            }
            setOpenModal(false)
          }}
        >
          <LabeledTextField name="title" label="Title" placeholder="Enter Job Title" />
        </Form>
      </Modal>

      {/* Mobile Menu */}
      <div className="flex flex-col space-y-4 md:hidden lg:hidden">
        <div className="flex w-full justify-between">
          {searchInput}
          {newJobButton}
        </div>

        <Form noFormatting={true} onSubmit={async () => {}}>
          <RadioGroupField
            name="View"
            isBorder={true}
            options={[JobViewType.Active, JobViewType.Archived]}
            initialValue={JobViewType.Active}
            onChange={(value) => {
              setViewType(value)
            }}
          />
        </Form>

        <div className="flex justify-center space-x-6">
          {/* {subscriptionLink} */}
          {/* {viewCareersPageLink} */}
          <ViewCareersPageButton companySlug={company?.slug || "0"} />
        </div>
      </div>

      {/* Tablet and Desktop Menu */}
      <div className="hidden md:flex lg:flex items-center w-full justify-between">
        <div className="flex items-center">
          {searchInput}
          <Form
            noFormatting={true}
            onSubmit={(value) => {
              return value
            }}
          >
            <RadioGroupField
              name="View"
              isBorder={false}
              options={[JobViewType.Active, JobViewType.Archived]}
              initialValue={JobViewType.Active}
              onChange={(value) => {
                setViewType(value)
              }}
            />
          </Form>
        </div>

        <div className="flex items-center space-x-6">
          {/* {subscriptionLink} */}
          {/* {viewCareersPageLink} */}
          <ViewCareersPageButton companySlug={company?.slug || "0"} />
          {newJobButton}
        </div>
      </div>

      <Modal header="" open={openWelcomeModal} setOpen={setOpenWelcomeModal}>
        <SignupWelcome
          setOpenModal={setOpenWelcomeModal}
          userName={user?.name || ""}
          userId={user?.id}
        />
      </Modal>

      <Suspense fallback={<p className="pt-7">Loading...</p>}>
        <Jobs
          viewType={viewType}
          user={user}
          company={company}
          // subscription={subscription}
          setOpenConfirm={setOpenConfirm}
          setConfirmMessage={setConfirmMessage}
          introSteps={introSteps}
          introStepsEnabled={introStepsEnabled}
          isIntroFirstLoad={isIntroFirstLoad}
          setIsIntroFirstLoad={setIsIntroFirstLoad}
          Steps={Steps}
          companyUsersLength={companyUsersLength}
        />
      </Suspense>
    </AuthLayout>
  )
}

JobsHome.authenticate = true

export default JobsHome
