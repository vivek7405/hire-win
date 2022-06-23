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
import getQuestions from "app/questions/queries/getQuestions"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection } from "types"
import { Question, QuestionOption } from "@prisma/client"
import deleteQuestion from "app/questions/mutations/deleteQuestion"
import createQuestion from "app/questions/mutations/createQuestion"
import updateQuestion from "app/questions/mutations/updateQuestion"
import Debouncer from "app/core/utils/debouncer"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "app/core/components/Modal"
import QuestionForm from "app/questions/components/QuestionForm"
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

const Questions = () => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null as any as Question)
  const [deleteQuestionMutation] = useMutation(deleteQuestion)
  const [questionToEdit, setQuestionToEdit] = useState(
    null as any as Question & { options: QuestionOption[] }
  )
  const [openModal, setOpenModal] = useState(false)
  const [createQuestionMutation] = useMutation(createQuestion)
  const [updateQuestionMutation] = useMutation(updateQuestion)

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
        header={`Delete Question - ${questionToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Question`)
          try {
            await deleteQuestionMutation({ id: questionToDelete?.id })
            toast.success("Question Deleted", { id: toastId })
            invalidateQuery(getQuestions)
          } catch (error) {
            toast.error(`Deleting question failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setQuestionToDelete(null as any)
        }}
      >
        Are you sure you want to delete the question?
      </Confirm>

      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setQuestionToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Question
      </button>

      <Modal header="Question" open={openModal} setOpen={setOpenModal}>
        <QuestionForm
          editmode={questionToEdit ? true : false}
          header={`${questionToEdit ? "Update" : "New"} Question`}
          subHeader="Enter question details"
          initialValues={
            questionToEdit
              ? {
                  name: questionToEdit?.name,
                  type: questionToEdit?.type,
                  placeholder: questionToEdit?.placeholder,
                  acceptedFiles: questionToEdit?.acceptedFiles,
                  options: questionToEdit?.options?.map((op) => {
                    return { id: op.id, text: op.text }
                  }),
                }
              : {}
          }
          onSubmit={async (values) => {
            const isEdit = questionToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Question" : "Creating Question")
            try {
              isEdit
                ? await updateQuestionMutation({
                    where: { id: questionToEdit.id },
                    data: { ...values },
                    initial: questionToEdit,
                  })
                : await createQuestionMutation({ ...values })
              await invalidateQuery(getQuestions)
              toast.success(
                isEdit ? "Question updated successfully" : "Question added successfully",
                {
                  id: toastId,
                }
              )
              setQuestionToEdit(null as any)
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
        resultName="question"
      />

      {questions?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Questions found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {questions.map((q) => {
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
                            setQuestionToEdit(q)
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
                          title="Delete Question"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setQuestionToDelete(q)
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
                    {q.type?.replaceAll("_", " ")}
                  </div>

                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {q.forms.length} {q.forms.length === 1 ? "Form" : "Forms"}
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

const QuestionsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="QuestionsHome | hire-win" user={user}>
      {/* <Link href={Routes.NewQuestion()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Question
        </a>
      </Link> */}

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Questions />
      </Suspense>
    </AuthLayout>
  )
}

QuestionsHome.authenticate = true

export default QuestionsHome
