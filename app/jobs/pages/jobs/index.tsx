import { useEffect, useState, useMemo, Suspense, useCallback } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  getSession,
  useMutation,
  useQuery,
  invalidateQuery,
  invokeWithMiddleware,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Guard from "app/guard/ability"
import Confirm from "app/core/components/Confirm"
import { checkPlan } from "app/users/utils/checkPlan"
import { CardType, DragDirection, ExtendedJob, ExtendedWorkflowStage, Plan, PlanName } from "types"
import { Candidate, Category, Stage, WorkflowStage } from "@prisma/client"
import moment from "moment"
import { Country, State } from "country-state-city"
import { titleCase } from "app/core/utils/titleCase"
import Form from "app/core/components/Form"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import setJobHidden from "app/jobs/mutations/setJobHidden"
import toast from "react-hot-toast"
import Cards from "app/core/components/Cards"
import { ArchiveIcon, CogIcon, ExternalLinkIcon, RefreshIcon } from "@heroicons/react/outline"
import getCategories from "app/categories/queries/getCategories"
import Card from "app/core/components/Card"
import Pagination from "app/core/components/Pagination"
import Debouncer from "app/core/utils/debouncer"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import setJobSalaryVisibility from "app/jobs/mutations/setJobSalaryVisibility"
import getCompany from "app/companies/queries/getCompany"
import getCompanyUser from "app/companies/queries/getCompanyUser"
import { loadStripe } from "@stripe/stripe-js"
import createStripeCheckoutSession from "app/companies/mutations/createStripeCheckoutSession"
import { plans } from "app/core/utils/plans"
import createStripeBillingPortal from "app/companies/mutations/createStripeBillingPortal"
import updateJob from "app/jobs/mutations/updateJob"
import setJobArchived from "app/jobs/mutations/setJobArchived"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const companyUser = await invokeWithMiddleware(
    getCompanyUser,
    {
      where: {
        companyId: session.companyId || 0,
        userId: session.userId || 0,
      },
    },
    { ...context }
  )

  if (user && !companyUser) {
    return {
      redirect: {
        destination: "/companies/new",
        permanent: false,
      },
      props: {},
    }
  }

  if (user && companyUser) {
    const { can: canCreate } = await Guard.can("create", "job", { session }, {})

    const currentPlan = checkPlan(companyUser.company)
    const priceId = plans?.find((plan) => plan.name === PlanName.PRO)?.priceId || "0"

    return { props: { user, company: companyUser.company, canCreate, currentPlan, priceId } }
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

const Jobs = ({
  user,
  company,
  currentPlan,
  setOpenConfirm,
  setConfirmMessage,
  viewArchived,
  viewExpired,
}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})

  const todayDate = new Date(new Date().toDateString())
  const [utcDateNow, setUTCDateNow] = useState(null as any)
  useEffect(() => {
    setUTCDateNow(moment().utc().toDate())
  }, [])

  const validThrough = utcDateNow
    ? viewExpired
      ? { lt: utcDateNow }
      : { gte: utcDateNow }
    : todayDate

  const [categories] = useQuery(getCategoriesWOPagination, {
    where: {
      companyId: company?.id,
      jobs: {
        some: {
          archived: viewArchived,
          validThrough,
        },
      },
    },
  })

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

  const [selectedCategoryId, setSelectedCategoryId] = useState("0")

  const [{ jobUsers, hasMore, count }] = usePaginatedQuery(getJobs, {
    where:
      selectedCategoryId !== "0"
        ? {
            userId: user?.id || 0,
            job: {
              archived: viewArchived,
              validThrough,
              companyId: company?.id || 0,
              categoryId: selectedCategoryId,
            },
            ...query,
          }
        : {
            userId: user?.id,
            job: {
              archived: viewArchived,
              validThrough,
              companyId: company?.id || 0,
            },
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

  const [setJobHiddenMutation] = useMutation(setJobHidden)
  const [setJobArchivedMutation] = useMutation(setJobArchived)
  const [setJobSalaryVisibilityMutation] = useMutation(setJobSalaryVisibility)

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

  const [openJobArchiveConfirm, setOpenJobArchiveConfirm] = useState(false)
  const [jobToArchive, setJobToArchive] = useState(null as any)

  useEffect(() => {
    invalidateQuery(getCategoriesWOPagination)
  }, [viewArchived, viewExpired])

  return (
    <>
      <Confirm
        open={openJobArchiveConfirm}
        setOpen={setOpenJobArchiveConfirm}
        header={`${viewArchived ? "Restore" : "Archive"} Job - ${jobToArchive?.title}`}
        onSuccess={async () => {
          const toastId = toast.loading(`${viewArchived ? "Restoring" : "Archiving"} Job`)
          try {
            await setJobArchivedMutation({
              where: { id: jobToArchive?.id },
              archived: !jobToArchive?.archived,
            })
            toast.success(`Job ${viewArchived ? "Restored" : "Archived"}`, { id: toastId })
            setOpenJobArchiveConfirm(false)
            setJobToArchive(null as any)
            setSelectedCategoryId("0")
            invalidateQuery(getJobs)
            invalidateQuery(getCategoriesWOPagination)
          } catch (error) {
            toast.error(
              `${viewArchived ? "Restoring" : "Archiving"} job failed - ${error.toString()}`,
              { id: toastId }
            )
          }
        }}
      >
        Are you sure you want to {viewArchived ? "Restore" : "Reject"} the job?
      </Confirm>

      <input
        placeholder="Search"
        type="text"
        defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
        className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
        onChange={(e) => {
          execDebouncer(e)
        }}
      />

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="job"
      />

      {jobUsers?.length > 0 && (
        <div className="flex space-x-2 w-full overflow-auto flex-nowrap">
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
                  await invalidateQuery(getJobs)
                }}
              >
                {category.name}
              </div>
            )
          })}
        </div>
      )}

      <div>
        {jobUsers
          .map((jobUser) => {
            return {
              ...jobUser.job,
              hasByPassedPlanLimit: !currentPlan && jobUsers?.length > 1,
              canUpdate: jobUser.role === "OWNER" || jobUser.role === "ADMIN",
            }
          })
          ?.map((job) => {
            const stages: (WorkflowStage & { stage: Stage })[] =
              job?.workflow?.stages?.sort((a, b) => {
                return a?.order - b?.order
              }) || []

            return (
              <>
                <Card isFull={true}>
                  <div className="bg-gray-50 w-full rounded">
                    <div className="flex items-center justify-between flex-wrap px-6 py-4">
                      <div className="w-full md:w-2/3 lg:w-4/5">
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
                      <div className="w-full md:w-1/3 lg:w-1/5 flex items-center md:justify-center lg:justify-center space-x-4 mt-6 md:mt-0 lg:mt-0">
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

                        <Form
                          noFormatting={true}
                          onSubmit={(value) => {
                            return value
                          }}
                        >
                          <LabeledToggleSwitch
                            name="toggleJobHidden"
                            label="Hidden"
                            flex={true}
                            height={4}
                            width={3}
                            value={job?.hidden}
                            defaultChecked={job?.hidden}
                            onChange={async (switchState: boolean) => {
                              const toastId = toast.loading(() => (
                                <span>
                                  <b>
                                    {switchState ? "Hiding" : "Unhiding"} job - {job?.title} from
                                    Job Board
                                  </b>
                                </span>
                              ))

                              try {
                                await setJobHiddenMutation({
                                  where: { slug: job?.slug! },
                                  hidden: switchState,
                                })

                                let newArr = [...data] as any
                                const updateIndex = newArr.findIndex((j) => j.id === job?.id)
                                if (updateIndex >= 0 && newArr[updateIndex]) {
                                  newArr[updateIndex].hidden = switchState
                                  setData(newArr)
                                }

                                toast.success(
                                  () => (
                                    <span>
                                      <b>
                                        {job?.title} job {switchState ? "hidden" : "unhidden"}{" "}
                                        successfully
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
                          />
                        </Form>

                        <Form
                          noFormatting={true}
                          onSubmit={(value) => {
                            return value
                          }}
                        >
                          <LabeledToggleSwitch
                            name="toggleJobSalaryVisibility"
                            label="Salary"
                            flex={true}
                            height={4}
                            width={3}
                            value={job?.showSalary}
                            defaultChecked={job?.showSalary}
                            onChange={async (switchState: boolean) => {
                              const toastId = toast.loading(() => (
                                <span>
                                  <b>
                                    {switchState ? "Showing" : "Hiding"} salary - {job?.showSalary}{" "}
                                    {switchState ? "on" : "from"}
                                    Job Board
                                  </b>
                                </span>
                              ))

                              try {
                                await setJobSalaryVisibilityMutation({
                                  where: { slug: job?.slug! },
                                  showSalary: switchState,
                                })

                                let newArr = [...data] as any
                                const updateIndex = newArr.findIndex((j) => j.id === job?.id)
                                if (updateIndex >= 0 && newArr[updateIndex]) {
                                  newArr[updateIndex].showSalary = switchState
                                  setData(newArr)
                                }

                                toast.success(
                                  () => (
                                    <span>
                                      <b>
                                        Salary for {job?.title} job{" "}
                                        {switchState ? "shown" : "hidden"} successfully
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
                          />
                        </Form>

                        <button
                          id={"archive-" + job?.id}
                          className="float-right text-red-600 hover:text-red-800"
                          title={viewArchived ? "Restore Job" : "Archive Job"}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setJobToArchive(job)
                            setOpenJobArchiveConfirm(true)
                          }}
                        >
                          {viewArchived ? (
                            <RefreshIcon className="w-6 h-6" />
                          ) : (
                            <ArchiveIcon className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="px-6 py-2 md:py-0 lg:py-0 md:pb-4 lg:pb-4">
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
                        {stages?.map((ws) => {
                          return (
                            <div
                              key={ws.id}
                              className="overflow-auto p-1 m-1 rounded-lg border-2 border-neutral-300 bg-white w-32 flex flex-col items-center justify-center"
                            >
                              <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                                {ws.stage?.name}
                              </div>
                              <div className="text-neutral-500">
                                {
                                  job?.candidates?.filter((c) => c.workflowStageId === ws.id)
                                    ?.length
                                }
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="px-6 pt-4 pb-2 flex flex-wrap md:items-center md:justify-center lg:items-center lg:justify-center">
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
                </Card>
              </>
            )
          })}
      </div>
    </>
  )
}

const JobsHome = ({
  user,
  company,
  canCreate,
  currentPlan,
  priceId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(
    "Upgrade to the Pro Plan to create unlimited jobs. You can create only 1 job on the Free plan."
  )
  const [viewArchived, setViewArchived] = useState(false)
  const [viewExpired, setViewExpired] = useState(false)

  // // Redirect user to stripe checkout if trial has ended
  // const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)
  // const manageBilling = useCallback(async () => {
  //   try {
  //     const url = await createStripeBillingPortalMutation({
  //       companyId: company?.id || 0,
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
  //       companyId: company?.id || 0,
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

  return (
    <AuthLayout title="Jobs | hire-win" user={user}>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Upgrade to the Pro Plan?"
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
      >
        {confirmMessage}
      </Confirm>
      {/* <Link href={Routes.NewJob()} passHref> */}
      <a
        className="cursor-pointer float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          if (canCreate) {
            return router.push(Routes.NewJob())
          } else {
            setConfirmMessage(
              "Upgrade to the Pro Plan to create unlimited jobs. You can create only 1 job on the Free plan."
            )
            setOpenConfirm(true)
          }
        }}
      >
        New Job
      </a>
      {/* </Link> */}

      <Link href={Routes.CareersPage({ companySlug: company?.slug! })} passHref>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800"
        >
          <span>View Careers Page</span>
          <ExternalLinkIcon className="w-4 h-4 ml-1" />
        </a>
      </Link>

      <div className="float-right text-theme-600 py-2 ml-3">
        <Form
          noFormatting={true}
          onSubmit={(value) => {
            return value
          }}
        >
          <LabeledToggleSwitch
            name="toggleViewArchived"
            label="View Archived"
            flex={true}
            value={viewArchived}
            onChange={(switchState) => {
              setViewArchived(switchState)
            }}
          />
        </Form>
      </div>

      <div className="float-right text-theme-600 py-2 ml-3">
        <Form
          noFormatting={true}
          onSubmit={(value) => {
            return value
          }}
        >
          <LabeledToggleSwitch
            name="toggleViewExpired"
            label="View Expired"
            flex={true}
            value={viewExpired}
            onChange={(switchState) => {
              setViewExpired(switchState)
            }}
          />
        </Form>
      </div>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Jobs
          viewArchived={viewArchived}
          viewExpired={viewExpired}
          user={user}
          company={company}
          currentPlan={currentPlan}
          setOpenConfirm={setOpenConfirm}
          setConfirmMessage={setConfirmMessage}
        />
      </Suspense>
    </AuthLayout>
  )
}

JobsHome.authenticate = true

export default JobsHome
