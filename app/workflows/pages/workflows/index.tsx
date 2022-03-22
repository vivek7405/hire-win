import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getWorkflows from "app/workflows/queries/getWorkflows"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection } from "types"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

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

const Workflows = ({ user }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            name: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

  // const [{ workflows, hasMore, count }] = usePaginatedQuery(getWorkflows, {
  //   where: {
  //     userId: user?.id,
  //     ...query,
  //   },
  //   skip: ITEMS_PER_PAGE * Number(tablePage),
  //   take: ITEMS_PER_PAGE,
  // })

  // let startPage = tablePage * ITEMS_PER_PAGE + 1
  // let endPage = startPage - 1 + ITEMS_PER_PAGE

  // if (endPage > count) {
  //   endPage = count
  // }

  const [workflows] = useQuery(getWorkflowsWOPagination, {
    where: {
      userId: user?.id,
      ...query,
    },
  })

  useMemo(async () => {
    let data: {}[] = []

    await workflows.forEach((workflow) => {
      data = [
        ...data,
        {
          ...workflow,
          canUpdate: workflow.userId === user.id,
        },
      ]

      setData(data)
    })
  }, [workflows, user.id])

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       return (
  //         <Link href={Routes.SingleWorkflowPage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`workflowlink`} className="text-theme-600 hover:text-theme-900">
  //             {props.cell.row.original.name}
  //           </a>
  //         </Link>
  //       )
  //     },
  //   },
  //   {
  //     Header: "Stages",
  //     Cell: (props) => {
  //       return props.cell.row.original.stages?.length
  //     },
  //   },
  //   {
  //     Header: "",
  //     accessor: "action",
  //     Cell: (props) => {
  //       return (
  //         <>
  //           {props.cell.row.original.canUpdate && (
  //             <Link
  //               href={Routes.WorkflowSettingsPage({ slug: props.cell.row.original.slug })}
  //               passHref
  //             >
  //               <a className="text-theme-600 hover:text-theme-900">Settings</a>
  //             </Link>
  //           )}
  //         </>
  //       )
  //     },
  //   },
  // ]

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
  //   />
  // )

  const getCards = (workflows) => {
    return workflows.map((w) => {
      return {
        id: w.id,
        title: w.name,
        description: `${w.stages?.length} ${w.stages?.length === 1 ? "Stage" : "Stages"}`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="w-full relative">
                <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                  <Link href={Routes.SingleWorkflowPage({ slug: w.slug })} passHref>
                    <a data-testid={`categorylink`} className="text-theme-600 hover:text-theme-800">
                      {w.name}
                    </a>
                  </Link>
                </div>
                <div className="absolute top-0 right-0">
                  {w.canUpdate && (
                    <Link href={Routes.WorkflowSettingsPage({ slug: w.slug })} passHref>
                      <a className="float-right text-theme-600 hover:text-theme-800">
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </a>
                    </Link>
                  )}
                </div>
              </div>
              <div className="border-b-2 border-gray-50 w-full"></div>
              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {`${w.stages?.length} ${w.stages?.length === 1 ? "Stage" : "Stages"}`}
              </div>
              <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                {w.stages
                  ?.sort((a, b) => {
                    return a.order - b.order
                  })
                  .map((ws) => {
                    return (
                      <div
                        key={ws.id}
                        className="p-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 w-32 flex flex-col items-center justify-center"
                      >
                        <div className="overflow-hidden text-sm text-neutral-600">
                          {ws.stage?.name}
                        </div>
                        {/* <div className="text-neutral-600">
                        {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
                      </div> */}
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
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
      noPagination={true}
      mutateCardDropDB={(source, destination, draggableId) => {}}
      droppableName="categories"
      isDragDisabled={true}
      direction={DragDirection.VERTICAL}
      cardWidth="full"
    />
  )
}

const WorkflowsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="WorkflowsHome | hire-win" user={user}>
      <Link href={Routes.NewWorkflow()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Workflow
        </a>
      </Link>

      <Link href={Routes.StagesHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Stage Pool
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Workflows user={user} />
      </Suspense>
    </AuthLayout>
  )
}

WorkflowsHome.authenticate = true

export default WorkflowsHome
