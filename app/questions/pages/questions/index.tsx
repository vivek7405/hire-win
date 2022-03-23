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
import getQuestions from "app/questions/queries/getQuestions"
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

export const Questions = ({ user }) => {
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

  const [{ questions, hasMore, count }] = usePaginatedQuery(getQuestions, {
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

    await questions.forEach((question) => {
      data = [
        ...data,
        {
          ...question,
          canUpdate: question.userId === user.id,
        },
      ]

      setData(data)
    })
  }, [questions, user.id])

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       return !props.cell.row.original.factory ? (
  //         <Link href={Routes.SingleQuestionPage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`questionlink`} className="text-theme-600 hover:text-theme-900">
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

  const getCards = (questions) => {
    return questions.map((q) => {
      return {
        id: q.id,
        title: q.name,
        description: `${q.forms?.length} ${q.forms?.length === 1 ? "Form" : "Forms"}`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="font-bold flex md:justify-center lg:justify:center">
                {!q.factory ? (
                  <Link href={Routes.SingleQuestionPage({ slug: q.slug })} passHref>
                    <a
                      data-testid={`questionlink`}
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

              <div className="text-neutral-600 flex md:justify-center lg:justify-center">
                {q.type?.replaceAll("_", " ")}
              </div>

              <div className="border-b-2 border-gray-50 w-full"></div>

              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                Used in {`${q.forms?.length} ${q.forms?.length === 1 ? "Form" : "Forms"}`}
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

const QuestionsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="QuestionsHome | hire-win" user={user}>
      <Link href={Routes.NewQuestion()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Question
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Questions user={user} />
      </Suspense>
    </AuthLayout>
  )
}

QuestionsHome.authenticate = true

export default QuestionsHome
