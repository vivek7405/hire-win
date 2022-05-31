import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useSession,
  useMutation,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection } from "types"
import deleteCardQuestion from "app/card-questions/mutations/deleteCardQuestion"
import createCardQuestion from "app/card-questions/mutations/createCardQuestion"
import updateCardQuestion from "app/card-questions/mutations/updateCardQuestion"
import getCardQuestions from "app/card-questions/queries/getCardQuestions"
import Debouncer from "app/core/utils/debouncer"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import { CardQuestion } from "@prisma/client"
import Modal from "app/core/components/Modal"
import CardQuestionForm from "app/card-questions/components/CardQuestionForm"
import Pagination from "app/core/components/Pagination"
import Card from "app/core/components/Card"
import { TrashIcon } from "@heroicons/react/outline"

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

const CardQuestions = () => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [cardQuestionToDelete, setCardQuestionToDelete] = useState(null as any as CardQuestion)
  const [deleteCardQuestionMutation] = useMutation(deleteCardQuestion)
  const [cardQuestionToEdit, setCardQuestionToEdit] = useState(null as any as CardQuestion)
  const [openModal, setOpenModal] = useState(false)
  const [createCardQuestionMutation] = useMutation(createCardQuestion)
  const [updateCardQuestionMutation] = useMutation(updateCardQuestion)

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
      companyId: session.companyId || 0,
      ...query,
    },
    orderBy: [{ factory: "desc" }, { name: "asc" }],
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

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

  return (
    <>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Question - ${cardQuestionToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Question`)
          try {
            await deleteCardQuestionMutation({ id: cardQuestionToDelete?.id })
            toast.success("Question Deleted", { id: toastId })
            setOpenConfirm(false)
            setCardQuestionToDelete(null as any)
            invalidateQuery(getCardQuestions)
          } catch (error) {
            toast.error(`Deleting question failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the Question?
      </Confirm>

      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setCardQuestionToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Question
      </button>

      <Modal header="CardQuestion" open={openModal} setOpen={setOpenModal}>
        <CardQuestionForm
          editmode={cardQuestionToEdit ? true : false}
          header={`${cardQuestionToEdit ? "Update" : "New"} CardQuestion`}
          subHeader=""
          initialValues={cardQuestionToEdit ? { name: cardQuestionToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = cardQuestionToEdit ? true : false

            const toastId = toast.loading(
              isEdit ? "Updating CardQuestion" : "Creating CardQuestion"
            )
            try {
              isEdit
                ? await updateCardQuestionMutation({
                    where: { id: cardQuestionToEdit.id },
                    data: { ...values },
                    initial: cardQuestionToEdit,
                  })
                : await createCardQuestionMutation({ ...values })
              await invalidateQuery(getCardQuestions)
              toast.success(
                isEdit ? "CardQuestion updated successfully" : "CardQuestion added successfully",
                {
                  id: toastId,
                }
              )
              setCardQuestionToEdit(null as any)
              setOpenModal(false)
            } catch (error) {
              toast.error(
                `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                { id: toastId }
              )
            }
          }}
        />
      </Modal>

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
        resultName="cardQuestion"
      />

      {cardQuestions?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No CardQuestions found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {cardQuestions.map((q) => {
            return (
              <Card key={q.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      {!q.factory ? (
                        <a
                          className="cursor-pointer text-theme-600 hover:text-theme-800"
                          onClick={(e) => {
                            e.preventDefault()
                            setCardQuestionToEdit(q)
                            setOpenModal(true)
                          }}
                        >
                          {q.name}
                        </a>
                      ) : (
                        <span>{q.name}</span>
                      )}
                    </div>
                    {!q.factory && (
                      <div className="absolute top-0.5 right-0">
                        <button
                          id={"delete-" + q.id}
                          className="float-right text-red-600 hover:text-red-800"
                          title="Delete CardQuestion"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setCardQuestionToDelete(q)
                            setOpenConfirm(true)
                          }}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {q.scoreCards.length} {q.scoreCards.length === 1 ? "Score Card" : "Score Cards"}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

const CardQuestionsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="CardQuestionsHome | hire-win" user={user}>
      {/* <Link href={Routes.NewCardQuestion()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Question
        </a>
      </Link> */}

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <CardQuestions />
      </Suspense>
    </AuthLayout>
  )
}

CardQuestionsHome.authenticate = true

export default CardQuestionsHome
