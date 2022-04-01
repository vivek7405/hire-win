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
import getCardQuestions from "app/card-questions/queries/getCardQuestions"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
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

export const CardQuestions = ({ user }) => {
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

  const [{ cardQuestions, hasMore, count }] = usePaginatedQuery(getCardQuestions, {
    where: {
      userId: user?.id,
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

  useMemo(async () => {
    let data: {}[] = []

    await cardQuestions.forEach((cardQuestion) => {
      data = [
        ...data,
        {
          ...cardQuestion,
          canUpdate: cardQuestion.userId === user.id,
        },
      ]

      setData(data)
    })
  }, [cardQuestions, user.id])

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       return !props.cell.row.original.factory ? (
  //         <Link href={Routes.SingleCardQuestionPage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`cardQuestionlink`} className="text-theme-600 hover:text-theme-900">
  //             {props.cell.row.original.name}
  //           </a>
  //         </Link>
  //       ) : (
  //         props.cell.row.original.name
  //       )
  //     },
  //   },
  //   {
  //     Header: "Type",
  //     accessor: "type",
  //     Cell: (props) => {
  //       return props.cell.row.original.type?.replaceAll("_", " ")
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

  const getCards = (cardQuestions) => {
    return cardQuestions.map((q) => {
      return {
        id: q.id,
        title: q.name,
        description: `${q.scoreCards?.length} ${
          q.scoreCards?.length === 1 ? "ScoreCard" : "ScoreCards"
        }`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="font-bold flex md:justify-center lg:justify:center">
                {!q.factory ? (
                  <Link href={Routes.SingleCardQuestionPage({ slug: q.slug })} passHref>
                    <a
                      data-testid={`cardQuestionlink`}
                      className="text-theme-600 hover:text-theme-800 overflow-hidden whitespace-nowrap"
                      title={q.name}
                    >
                      {q.name}
                    </a>
                  </Link>
                ) : (
                  <span>{q.name}</span>
                )}
              </div>

              <div className="border-b-2 border-gray-50 w-full"></div>

              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {`${q.scoreCards?.length} ${
                  q.scoreCards?.length === 1 ? "Score Card" : "Score Cards"
                }`}
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
      resultName="Question"
    />
  )
}

const CardQuestionsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="CardQuestionsHome | hire-win" user={user}>
      <Link href={Routes.NewCardQuestion()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Question
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <CardQuestions user={user} />
      </Suspense>
    </AuthLayout>
  )
}

CardQuestionsHome.authenticate = true

export default CardQuestionsHome
