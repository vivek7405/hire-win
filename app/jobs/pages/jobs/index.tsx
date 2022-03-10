import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  getSession,
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
import { Plan, PlanName } from "types"

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

  let columns = [
    {
      Header: "Title",
      accessor: "title",
      Cell: (props) => {
        return (
          // <Link href={Routes.SingleJobPage({ slug: props.cell.row.original.slug })} passHref>
          <a
            data-testid={`joblink`}
            className="cursor-pointer text-theme-600 hover:text-theme-900"
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
            {props.value}
          </a>
          // </Link>
        )
      },
    },
    {
      Header: "Candidates",
      Cell: (props) => {
        return props.cell.row.original.candidates?.length
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: (props) => {
        return (
          <>
            {props.cell.row.original.canUpdate && (
              // <Link href={Routes.JobSettingsPage({ slug: props.cell.row.original.slug })} passHref>
              <a
                className="cursor-pointer text-theme-600 hover:text-theme-900"
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
                Settings
              </a>
              // </Link>
            )}
          </>
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
          className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800"
        >
          Job Board
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
