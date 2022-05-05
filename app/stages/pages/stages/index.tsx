import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getStages from "app/stages/queries/getStages"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import { Stage } from "@prisma/client"
import { CardType, DragDirection } from "types"
import Cards from "app/core/components/Cards"

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

export const Stages = ({ user }) => {
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

  const [{ stages, hasMore, count }] = usePaginatedQuery(getStages, {
    where: {
      userId: user?.id,
      ...query,
    },
    orderBy: { allowEdit: "asc" },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  useMemo(async () => {
    let data: {}[] = []

    await stages.forEach((stage) => {
      data = [
        ...data,
        {
          ...stage,
          canUpdate: stage.userId === user.id,
        },
      ]

      setData(data)
    })
  }, [stages, user.id])

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       const stage = props.cell.row.original as Stage

  //       return stage.allowEdit ? (
  //         <Link href={Routes.SingleStagePage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`stagelink`} className="text-theme-600 hover:text-theme-900">
  //             {props.value}
  //           </a>
  //         </Link>
  //       ) : (
  //         props.value
  //       )
  //     },
  //   },
  //   // {
  //   //   Header: "",
  //   //   accessor: "action",
  //   //   Cell: (props) => {
  //   //     return (
  //   //       <>
  //   //         {props.cell.row.original.canUpdate && (
  //   //           <Link
  //   //             href={Routes.StageSettingsPage({ slug: props.cell.row.original.slug })}
  //   //             passHref
  //   //           >
  //   //             <a className="text-theme-600 hover:text-theme-900">Settings</a>
  //   //           </Link>
  //   //         )}
  //   //       </>
  //   //     )
  //   //   },
  //   // },
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

  const getCards = (stages) => {
    return stages.map((s) => {
      return {
        id: s.id,
        title: s.name,
        description: `${s.workflows?.length} ${
          s.workflows?.length === 1 ? "Workflow" : "Workflows"
        }`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="font-bold flex md:justify-center lg:justify:center">
                {s.allowEdit ? (
                  <Link href={Routes.SingleStagePage({ slug: s.slug })} passHref>
                    <a
                      data-testid={`stagelink`}
                      className="text-theme-600 hover:text-theme-800 overflow-hidden whitespace-nowrap"
                      title={s.name}
                    >
                      {s.name}
                    </a>
                  </Link>
                ) : (
                  <span>{s.name}</span>
                )}
              </div>

              <div className="border-b-2 border-gray-50 w-full"></div>

              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {`${s.workflows?.length} ${s.workflows?.length === 1 ? "Workflow" : "Workflows"}`}
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
      mutateCardDropDB={(source, destination, draggableId) => {}}
      droppableName="categories"
      isDragDisabled={true}
      direction={DragDirection.HORIZONTAL}
      pageIndex={tablePage}
      hasNext={hasMore}
      hasPrevious={tablePage !== 0}
      totalCount={count}
      startPage={startPage}
      endPage={endPage}
      resultName="stage"
    />
  )
}

const StagesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="StagesHome | hire-win" user={user}>
      <Link href={Routes.NewStage()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Stage
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Stages user={user} />
      </Suspense>
    </AuthLayout>
  )
}

StagesHome.authenticate = true

export default StagesHome
