import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
  useSession,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getScoreCards from "app/score-cards/queries/getScoreCards"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection, ExtendedScoreCard } from "types"
import { CogIcon } from "@heroicons/react/outline"
import getScoreCardsWOPagination from "app/score-cards/queries/getScoreCardsWOPagination"

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

const ScoreCards = ({ user }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})
  const session = useSession()

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

  // const [{ scoreCards, hasMore, count }] = usePaginatedQuery(getScoreCards, {
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

  const [scoreCards] = useQuery(getScoreCardsWOPagination, {
    where: {
      companyId: session.companyId || 0,
      ...query,
    },
  })

  useMemo(async () => {
    let data: {}[] = []

    await scoreCards.forEach((scoreCard) => {
      data = [
        ...data,
        {
          ...scoreCard,
          canUpdate: scoreCard.companyId === session.companyId,
        },
      ]

      setData(data)
    })
  }, [scoreCards, session.companyId])

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       return (
  //         <Link href={Routes.SingleScoreCardPage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`scoreCardlink`} className="text-theme-600 hover:text-theme-900">
  //             {props.cell.row.original.name}
  //           </a>
  //         </Link>
  //       )
  //     },
  //   },
  //   {
  //     Header: "CardQuestions",
  //     Cell: (props) => {
  //       return props.cell.row.original.cardQuestions.length
  //     },
  //   },
  //   {
  //     Header: "",
  //     accessor: "action",
  //     Cell: (props) => {
  //       return (
  //         <>
  //           {props.cell.row.original.canUpdate && (
  //             <Link href={Routes.ScoreCardSettingsPage({ slug: props.cell.row.original.slug })} passHref>
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

  const getCards = (scoreCards) => {
    return scoreCards.map((f) => {
      return {
        id: f.id,
        title: f.name,
        description: `${f.cardQuestions?.length} ${
          f.cardQuestions?.length === 1 ? "CardQuestion" : "CardQuestions"
        }`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="w-full relative">
                <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                  <Link href={Routes.SingleScoreCardPage({ slug: f.slug })} passHref>
                    <a
                      data-testid={`scoreCardlink`}
                      className="text-theme-600 hover:text-theme-800"
                    >
                      {f.name}
                    </a>
                  </Link>
                </div>
                <div className="absolute top-0.5 right-0">
                  {f.canUpdate && (
                    <Link href={Routes.ScoreCardSettingsPage({ slug: f.slug })} passHref>
                      <a className="float-right text-theme-600 hover:text-theme-800">
                        <CogIcon className="h-6 w-6" />
                      </a>
                    </Link>
                  )}
                </div>
              </div>
              <div className="border-b-2 border-gray-50 w-full"></div>
              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {`${f.cardQuestions?.length} ${
                  f.cardQuestions?.length === 1 ? "Question" : "Questions"
                } · ${f.jobWorkflowStages?.length} ${
                  f.jobWorkflowStages?.length === 1 ? "Job" : "Jobs"
                }`}
              </div>
              <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                {f.cardQuestions
                  ?.sort((a, b) => {
                    return a.order - b.order
                  })
                  .map((fq) => {
                    return (
                      <div
                        key={fq.id}
                        className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                      >
                        <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                          {fq.cardQuestion?.name}
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
          // <>
          //   <div>
          //     <span>
          //       <div className="w-full relative">
          //         <div className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between">
          //           <Link href={Routes.SingleScoreCardPage({ slug: f.slug })} passHref>
          //             <a data-testid={`scoreCardlink`} className="text-theme-600 hover:text-theme-800">
          //               {f.name}
          //             </a>
          //           </Link>
          //         </div>
          //         <div className="absolute top-0.5 right-0">
          //           {f.canUpdate && (
          //             <Link href={Routes.ScoreCardSettingsPage({ slug: f.slug })} passHref>
          //               <a className="float-right text-theme-600 hover:text-theme-800">
          //                 <CogIcon className="h-5 w-5" />
          //               </a>
          //             </Link>
          //           )}
          //         </div>
          //       </div>
          //     </span>
          //     <div className="pt-2.5">
          //       {`${f.cardQuestions?.length} ${f.cardQuestions?.length === 1 ? "CardQuestion" : "CardQuestions"}`}
          //     </div>
          //   </div>
          // </>
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
      droppableName="scoreCards"
      isDragDisabled={true}
      direction={DragDirection.VERTICAL}
      isFull={true}
    />
  )
}

const ScoreCardsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="ScoreCardsHome | hire-win" user={user}>
      <Link href={Routes.NewScoreCard()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Score Card
        </a>
      </Link>

      <Link href={Routes.CardQuestionsHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Question Pool
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <ScoreCards user={user} />
      </Suspense>
    </AuthLayout>
  )
}

ScoreCardsHome.authenticate = true

export default ScoreCardsHome
