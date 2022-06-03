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
  useMutation,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getScoreCards from "app/score-cards/queries/getScoreCards"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection, ExtendedScoreCard } from "types"
import { CogIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline"
import getScoreCardsWOPagination from "app/score-cards/queries/getScoreCardsWOPagination"
import groupByKey from "app/core/utils/groupByKey"
import { ScoreCard } from "@prisma/client"
import deleteScoreCard from "app/score-cards/mutations/deleteScoreCard"
import createScoreCard from "app/score-cards/mutations/createScoreCard"
import updateScoreCard from "app/score-cards/mutations/updateScoreCard"
import Debouncer from "app/core/utils/debouncer"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "app/core/components/Modal"
import ScoreCardForm from "app/score-cards/components/ScoreCardForm"
import Card from "app/core/components/Card"

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

const ScoreCards = () => {
  const router = useRouter()
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [scoreCardToDelete, setScoreCardToDelete] = useState(null as any as ScoreCard)
  const [deleteScoreCardMutation] = useMutation(deleteScoreCard)
  const [scoreCardToEdit, setScoreCardToEdit] = useState(null as any as ScoreCard)
  const [openModal, setOpenModal] = useState(false)
  const [createScoreCardMutation] = useMutation(createScoreCard)
  const [updateScoreCardMutation] = useMutation(updateScoreCard)

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

  const [scoreCards] = useQuery(getScoreCardsWOPagination, {
    where: {
      companyId: session.companyId || 0,
      ...query,
    },
  })

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
        header={`Delete ScoreCard - ${scoreCardToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting score card`)
          try {
            await deleteScoreCardMutation({ id: scoreCardToDelete?.id })
            toast.success("Score card deleted", { id: toastId })
            setOpenConfirm(false)
            setScoreCardToDelete(null as any)
            invalidateQuery(getScoreCardsWOPagination)
          } catch (error) {
            toast.error(`Deleting score card failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the score card?
      </Confirm>

      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setScoreCardToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Score Card
      </button>

      <Modal header="Score Card" open={openModal} setOpen={setOpenModal}>
        <ScoreCardForm
          header={`${scoreCardToEdit ? "Update" : "New"} Score Card`}
          subHeader=""
          initialValues={scoreCardToEdit ? { name: scoreCardToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = scoreCardToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Score Card" : "Creating Score Card")
            try {
              isEdit
                ? await updateScoreCardMutation({
                    where: { id: scoreCardToEdit.id },
                    data: { ...values },
                    initial: scoreCardToEdit,
                  })
                : await createScoreCardMutation({ ...values })
              await invalidateQuery(getScoreCardsWOPagination)
              toast.success(
                isEdit ? "Score Card updated successfully" : "Score Card added successfully",
                {
                  id: toastId,
                }
              )
              setScoreCardToEdit(null as any)
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

      {scoreCards?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Score Cards found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {scoreCards.map((w) => {
            return (
              <Card isFull={true} key={w.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                      <Link href={Routes.SingleScoreCardPage({ slug: w.slug })} passHref>
                        <a
                          data-testid={`categorylink`}
                          className="text-theme-600 hover:text-theme-800"
                        >
                          {w.name}
                        </a>
                      </Link>
                    </div>
                    {!w.factory && (
                      <>
                        <div className="absolute top-0.5 right-5">
                          {w.companyId === session.companyId && (
                            <button
                              id={"edit-" + w.id}
                              className="float-right text-indigo-600 hover:text-indigo-800"
                              title="Edit ScoreCard"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setScoreCardToEdit(w)
                                setOpenModal(true)
                              }}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="absolute top-0.5 right-0">
                          <button
                            id={"delete-" + w.id}
                            className="float-right text-red-600 hover:text-red-800"
                            title="Delete ScoreCard"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setScoreCardToDelete(w)
                              setOpenConfirm(true)
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {`${w.cardQuestions?.length} ${
                      w.cardQuestions?.length === 1 ? "Question" : "Questions"
                    } · ${Object.keys(groupByKey(w.jobWorkflowStages, "jobId"))?.length} ${
                      Object.keys(groupByKey(w.jobWorkflowStages, "jobId"))?.length === 1
                        ? "Job"
                        : "Jobs"
                    }`}
                  </div>
                  <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                    {w.cardQuestions
                      // ?.sort((a, b) => {
                      //   return a.order - b.order
                      // })
                      .map((ws) => {
                        return (
                          <div
                            key={ws.id}
                            className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                          >
                            <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                              {ws.cardQuestion?.name}
                            </div>
                          </div>
                        )
                      })}
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

const ScoreCardsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="ScoreCardsHome | hire-win" user={user}>
      {/* <Link href={Routes.NewScoreCard()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Score Card
        </a>
      </Link>

      <Link href={Routes.CardQuestionsHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Question Pool
        </a>
      </Link> */}

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <ScoreCards />
      </Suspense>
    </AuthLayout>
  )
}

ScoreCardsHome.authenticate = true

export default ScoreCardsHome
