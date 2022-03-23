import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  getSession,
  useMutation,
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
import { Candidate, Category } from "@prisma/client"
import moment from "moment"
import { Country, State } from "country-state-city"
import { titleCase } from "app/core/utils/titleCase"
import Form from "app/core/components/Form"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import setJobHidden from "app/jobs/mutations/setJobHidden"
import toast from "react-hot-toast"
import Cards from "app/core/components/Cards"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  if (user) {
    const { can: canCreate } = await Guard.can("create", "job", { session }, {})

    const currentPlan = checkPlan(user)

    return { props: { user, canCreate, currentPlan } }
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

const Jobs = ({ user, currentPlan, setOpenConfirm, setConfirmMessage }) => {
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
          hasByPassedPlanLimit: !currentPlan && memberships?.length > 1,
          canUpdate: membership.role === "OWNER" || membership.role === "ADMIN",
        },
      ]

      setData(data)
    })
  }, [memberships, currentPlan])

  // let columns = [
  //   {
  //     Header: "Title",
  //     accessor: "title",
  //     Cell: (props) => {
  //       return (
  //         // <Link href={Routes.SingleJobPage({ slug: props.cell.row.original.slug })} passHref>
  //         <a
  //           data-testid={`joblink`}
  //           className="cursor-pointer text-theme-600 hover:text-theme-900"
  //           onClick={(e) => {
  //             e.preventDefault()
  //             if (props.cell.row.original.hasByPassedPlanLimit) {
  //               setConfirmMessage(
  //                 "Upgrade to the Pro Plan to view this job since you've bypassed the 1 job limit on Free plan."
  //               )
  //               setOpenConfirm(true)
  //             } else {
  //               router.push(Routes.SingleJobPage({ slug: props.cell.row.original.slug }))
  //             }
  //           }}
  //         >
  //           {props.value}
  //         </a>
  //         // </Link>
  //       )
  //     },
  //   },
  //   {
  //     Header: "Category",
  //     accessor: "category",
  //     Cell: (props) => {
  //       const category = props.value as Category
  //       return category?.name
  //     },
  //   },
  //   {
  //     Header: "Candidates",
  //     accessor: "candidates",
  //     Cell: (props) => {
  //       const candidates = props.value as Candidate[]
  //       return candidates?.length
  //     },
  //   },
  //   {
  //     Header: "",
  //     accessor: "action",
  //     Cell: (props) => {
  //       return (
  //         <>
  //           {props.cell.row.original.canUpdate && (
  //             // <Link href={Routes.JobSettingsPage({ slug: props.cell.row.original.slug })} passHref>
  //             <a
  //               className="cursor-pointer text-theme-600 hover:text-theme-900"
  //               onClick={(e) => {
  //                 e.preventDefault()
  //                 if (props.cell.row.original.hasByPassedPlanLimit) {
  //                   setConfirmMessage(
  //                     "Upgrade to the Pro Plan to update this job since you've bypassed the 1 job limit on Free plan."
  //                   )
  //                   setOpenConfirm(true)
  //                 } else {
  //                   router.push(Routes.JobSettingsPage({ slug: props.cell.row.original.slug }))
  //                 }
  //               }}
  //             >
  //               Settings
  //             </a>
  //             // </Link>
  //           )}
  //         </>
  //       )
  //     },
  //   },
  // ]

  const [setJobHiddenMutation] = useMutation(setJobHidden)

  let columns = [
    {
      Header: "All Jobs",
      Cell: (props) => {
        const job: ExtendedJob = props.cell.row.original
        const stages: ExtendedWorkflowStage[] =
          job?.workflow?.stages?.sort((a, b) => {
            return a?.order - b?.order
          }) || []

        return (
          <div className="bg-gray-50 w-full rounded">
            <div className="flex items-center justify-between flex-wrap px-6 py-4">
              <div className="w-full md:w-2/3 lg:w-4/5">
                <div className="font-bold text-xl text-theme-900 whitespace-normal">
                  <a
                    data-testid={`joblink`}
                    className="cursor-pointer text-theme-600 hover:text-theme-800"
                    onClick={(e) => {
                      e.preventDefault()
                      if (props.cell.row.original.hasByPassedPlanLimit) {
                        setConfirmMessage(
                          "Upgrade to the Pro Plan to view this job since you've bypassed the 1 job limit on Free plan."
                        )
                        setOpenConfirm(true)
                      } else {
                        router.push(Routes.SingleJobPage({ slug: props.cell.row.original.slug }))
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
              <div className="w-full md:w-1/3 lg:w-1/5 flex items-center md:justify-center lg:justify-center space-x-6 mt-6 md:mt-0 lg:mt-0">
                <a
                  className="cursor-pointer text-theme-600 hover:text-theme-800"
                  onClick={(e) => {
                    e.preventDefault()
                    if (props.cell.row.original.hasByPassedPlanLimit) {
                      setConfirmMessage(
                        "Upgrade to the Pro Plan to update this job since you've bypassed the 1 job limit on Free plan."
                      )
                      setOpenConfirm(true)
                    } else {
                      router.push(Routes.JobSettingsPage({ slug: props.cell.row.original.slug }))
                    }
                  }}
                >
                  Job Settings
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
                          <b>Hiding job - {job?.title} from Job Board</b>
                        </span>
                      ))

                      try {
                        await setJobHiddenMutation({
                          where: { slug: job?.slug! },
                          hidden: switchState,
                        })
                        job.hidden = switchState

                        toast.success(
                          () => (
                            <span>
                              <b>
                                {job?.title} job {switchState ? "hidden" : "unhidden"} successfully
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
              </div>
            </div>

            <div className="px-6 py-2 md:py-0 lg:py-0 md:pb-4 lg:pb-4">
              <div className="text-xl text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {job?.candidates?.length} candidates
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
              <div className="hidden md:flex lg:flex flex-wrap mt-2 items-center md:justify-center lg:justify-center">
                {stages?.map((ws) => {
                  return (
                    <div
                      key={ws.id}
                      className="p-1 m-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 w-32 flex flex-col items-center justify-center"
                    >
                      <div className="overflow-hidden text-sm text-neutral-600 whitespace-nowrap w-full text-center">
                        {ws.stage?.name}
                      </div>
                      <div className="text-neutral-600">
                        {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
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
              {job?.remote && (
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {job?.remote && "Remote"}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
  ]

  const getCards = (jobs) => {
    return jobs.map((job) => {
      const stages: ExtendedWorkflowStage[] =
        job?.workflow?.stages?.sort((a, b) => {
          return a?.order - b?.order
        }) || []

      return {
        id: job.id,
        title: job.title,
        description: "",
        renderContent: (
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
              <div className="w-full md:w-1/3 lg:w-1/5 flex items-center md:justify-center lg:justify-center space-x-6 mt-6 md:mt-0 lg:mt-0">
                <a
                  className="cursor-pointer text-theme-600 hover:text-theme-800"
                  onClick={(e) => {
                    e.preventDefault()
                    if (job.hasByPassedPlanLimit) {
                      setConfirmMessage(
                        "Upgrade to the Pro Plan to update this job since you've bypassed the 1 job limit on Free plan."
                      )
                      setOpenConfirm(true)
                    } else {
                      router.push(Routes.JobSettingsPage({ slug: job.slug }))
                    }
                  }}
                >
                  Job Settings
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
                          <b>Hiding job - {job?.title} from Job Board</b>
                        </span>
                      ))

                      try {
                        await setJobHiddenMutation({
                          where: { slug: job?.slug! },
                          hidden: switchState,
                        })
                        job.hidden = switchState

                        toast.success(
                          () => (
                            <span>
                              <b>
                                {job?.title} job {switchState ? "hidden" : "unhidden"} successfully
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
              </div>
            </div>

            <div className="px-6 py-2 md:py-0 lg:py-0 md:pb-4 lg:pb-4">
              <div className="text-xl text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {job?.candidates?.length} candidates
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
              <div className="hidden md:flex lg:flex flex-wrap mt-2 items-center md:justify-center lg:justify-center">
                {stages?.map((ws) => {
                  return (
                    <div
                      key={ws.id}
                      className="p-1 m-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 w-32 flex flex-col items-center justify-center"
                    >
                      <div className="overflow-hidden text-sm text-neutral-600 whitespace-nowrap w-full text-center">
                        {ws.stage?.name}
                      </div>
                      <div className="text-neutral-600">
                        {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
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
              {job?.remote && (
                <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {job?.remote && "Remote"}
                </span>
              )}
            </div>
          </div>
        ),
      }
    }) as CardType[]
  }

  const [cards, setCards] = useState(getCards(data))
  useEffect(() => {
    setCards(getCards(data))
  }, [data])

  return (
    <Cards
      cards={cards}
      setCards={setCards}
      mutateCardDropDB={(source, destination, draggableId) => {}}
      droppableName="categories"
      isDragDisabled={true}
      direction={DragDirection.VERTICAL}
      isFull={true}
      pageIndex={tablePage}
      hasNext={hasMore}
      hasPrevious={tablePage !== 0}
      totalCount={count}
      startPage={startPage}
      endPage={endPage}
      resultName="job"
    />
  )

  // return (
  //   <Table
  //     columns={columns}
  //     data={data}
  //     pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
  //     pageIndex={tablePage}
  //     pageSize={ITEMS_PER_PAGE}
  //     hasNext={hasMore}
  //     hasPrevious={tablePage !== 0}
  //     totalCount={count}
  //     startPage={startPage}
  //     endPage={endPage}
  //     resultName="job"
  //   />
  // )
}

const JobsHome = ({
  user,
  canCreate,
  currentPlan,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(
    "Upgrade to the Pro Plan to create unlimited jobs. You can create only 1 job on the Free plan."
  )

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

      <Link href={Routes.JobBoard({ companySlug: user?.slug! })} passHref>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800"
        >
          <span className="mr-1">View Job Board</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Jobs
          user={user}
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
