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
import getCategories from "app/categories/queries/getCategories"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import { Job } from "@prisma/client"
import { CardType, DragDirection, ExtendedCategory } from "types"
import Debouncer from "app/core/utils/debouncer"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
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

const Categories = ({ user }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedCategory[]>([])
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

  // const [{ categories, hasMore, count }] = usePaginatedQuery(getCategories, {
  //   where: {
  //     userId: user?.id,
  //     ...query,
  //   },
  //   skip: ITEMS_PER_PAGE * Number(tablePage),
  //   take: ITEMS_PER_PAGE,
  // })

  // // Use blitz guard to check if user can update t

  // let startPage = tablePage * ITEMS_PER_PAGE + 1
  // let endPage = startPage - 1 + ITEMS_PER_PAGE

  // if (endPage > count) {
  //   endPage = count
  // }

  // alert(JSON.stringify(query))
  const [categories] = useQuery(getCategoriesWOPagination, {
    where: {
      userId: user?.id,
      ...query,
    },
  })

  useMemo(async () => {
    let data: ExtendedCategory[] = []

    await categories.forEach((category) => {
      data = [
        ...data,
        {
          ...category,
          canUpdate: category.userId === user.id,
        } as any,
      ]

      setData(data)
    })
  }, [categories, user.id])

  const getCards = (categories) => {
    return categories.map((c) => {
      return {
        id: c.id,
        title: c.name,
        description: `${c.jobs?.length} ${c.jobs?.length === 1 ? "Job" : "Jobs"}`,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="font-bold flex md:justify-center lg:justify:center">
                {c.canUpdate ? (
                  <Link href={Routes.SingleCategoryPage({ slug: c.slug })} passHref>
                    <a
                      data-testid={`stagelink`}
                      className="text-theme-600 hover:text-theme-800 overflow-hidden whitespace-nowrap"
                      title={c.name}
                    >
                      {c.name}
                    </a>
                  </Link>
                ) : (
                  <span>{c.name}</span>
                )}
              </div>

              <div className="border-b-2 border-gray-50 w-full"></div>

              <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                {`${c.jobs?.length} ${c.jobs?.length === 1 ? "Job" : "Jobs"}`}
              </div>
            </div>
          </>
          // <>
          //   <div>
          //     <span>
          //       <div className="border-b-2 border-gray-50 pb-1 font-bold flex justify-between">
          //         <Link href={Routes.SingleCategoryPage({ slug: c.slug })} passHref>
          //           <a data-testid={`categorylink`} className="text-theme-600 hover:text-theme-800">
          //             {c.name}
          //           </a>
          //         </Link>
          //       </div>
          //     </span>
          //     <div className="pt-2.5">
          //       {`${c.jobs?.length} ${c.jobs?.length === 1 ? "Job" : "Jobs"}`}
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

  // let columns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //     Cell: (props) => {
  //       return (
  //         <Link href={Routes.SingleCategoryPage({ slug: props.cell.row.original.slug })} passHref>
  //           <a data-testid={`categorylink`} className="text-theme-600 hover:text-theme-900">
  //             {props.cell.row.original.name}
  //           </a>
  //         </Link>
  //       )
  //     },
  //   },
  //   {
  //     Header: "Jobs",
  //     accessor: "jobs",
  //     Cell: (props) => {
  //       const jobs = props.value as Job[]
  //       return <p>{jobs?.length}</p>
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

  return (
    <Cards
      cards={cards}
      setCards={setCards}
      noPagination={true}
      mutateCardDropDB={(source, destination, draggableId) => {}}
      droppableName="categories"
      isDragDisabled={true}
      direction={DragDirection.HORIZONTAL}
    />
  )
}

const CategoriesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="CategoriesHome | hire-win" user={user}>
      <Link href={Routes.NewCategory()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Category
        </a>
      </Link>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Categories user={user} />
      </Suspense>
    </AuthLayout>
  )
}

CategoriesHome.authenticate = true

export default CategoriesHome
