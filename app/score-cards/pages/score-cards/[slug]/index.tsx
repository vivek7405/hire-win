import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Link,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  usePaginatedQuery,
  useRouter,
  useMutation,
  useQuery,
  useSession,
  invalidateQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getScoreCard from "app/score-cards/queries/getScoreCard"
import Skeleton from "react-loading-skeleton"
import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import getScoreCardQuestions from "app/score-cards/queries/getScoreCardQuestions"
import AddExistingCardQuestionsForm from "app/score-cards/components/AddExistingCardQuestionsForm"
import toast from "react-hot-toast"
import createScoreCardQuestion from "app/score-cards/mutations/createScoreCardQuestion"
import { ScoreCardQuestion, ScoreCardQuestions } from "app/score-cards/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon, TrashIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedScoreCardQuestion, ShiftDirection } from "types"
import shiftScoreCardQuestion from "app/score-cards/mutations/shiftScoreCardQuestion"
import Confirm from "app/core/components/Confirm"
import removeCardQuestionFromScoreCard from "app/score-cards/mutations/removeCardQuestionFromScoreCard"
import ScoreCard from "app/score-cards/components/ScoreCard"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import Form from "app/core/components/Form"
import updateScoreCardQuestion from "app/score-cards/mutations/updateScoreCardQuestion"
import factoryScoreCardQuestions from "app/card-questions/utils/factoryScoreCardQuestions"
import getScoreCardQuestionsWOPagination from "app/score-cards/queries/getScoreCardQuestionsWOPagination"
import CardQuestionForm from "app/card-questions/components/CardQuestionForm"
import createCardQuestion from "app/card-questions/mutations/createCardQuestion"
import addExistingScoreCardQuestions from "app/score-cards/mutations/addExistingScoreCardQuestions"
import addNewCardQuestionToScoreCard from "app/score-cards/mutations/addNewCardQuestionToScoreCard"
import Cards from "app/core/components/Cards"
import Debouncer from "app/core/utils/debouncer"
import { CardQuestion, ScoreCardQuestionBehaviour } from "@prisma/client"
import updateCardQuestion from "app/card-questions/mutations/updateCardQuestion"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const { can: canUpdate } = await Guard.can(
    "update",
    "scoreCard",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      const scoreCard = await invokeWithMiddleware(
        getScoreCard,
        { where: { slug: context?.params?.slug!, companyId: session?.companyId || 0 } },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          scoreCard: scoreCard,
        },
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/login?next=/scoreCards/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

export const CardQuestions = ({
  user,
  scoreCard,
  companyId,
  setCardQuestionToEdit,
  setOpenAddNewCardQuestion,
}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedScoreCardQuestion[]>([])
  const [query, setQuery] = useState({})
  const [shiftScoreCardQuestionMutation] = useMutation(shiftScoreCardQuestion)
  const [updateScoreCardQuestionMutation] = useMutation(updateScoreCardQuestion)
  const [removeCardQuestionFromScoreCardMutation] = useMutation(removeCardQuestionFromScoreCard)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [scoreCardQuestionToRemove, setScoreCardQuestionToRemove] = React.useState(
    {} as ExtendedScoreCardQuestion
  )

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            cardQuestion: {
              name: {
                contains: JSON.parse(router.query.search as string),
                mode: "insensitive",
              },
            },
          },
        }
      : {}

    setQuery(search)
  }, [router.query])

  // const [{ scoreCardQuestions, hasMore, count }] = usePaginatedQuery(getScoreCardQuestions, {
  //   where: {
  //     scoreCardId: scoreCard?.id,
  //     ...query,
  //   },
  //   orderBy: { order: "asc" },
  //   skip: ITEMS_PER_PAGE * Number(tablePage),
  //   take: ITEMS_PER_PAGE,
  // })

  // let startPage = tablePage * ITEMS_PER_PAGE + 1
  // let endPage = startPage - 1 + ITEMS_PER_PAGE

  // if (endPage > count) {
  //   endPage = count
  // }

  const [scoreCardQuestions] = useQuery(getScoreCardQuestionsWOPagination, {
    where: {
      scoreCardId: scoreCard?.id,
      ...query,
    },
    orderBy: { order: "asc" },
  })

  useMemo(async () => {
    let data: ExtendedScoreCardQuestion[] = []

    await scoreCardQuestions.forEach((scoreCardQuestion) => {
      data = [...data, { ...(scoreCardQuestion as any) }]
      setData(data)
    })
  }, [scoreCardQuestions])

  const getCards = useCallback(
    (scoreCardQuestions) => {
      return scoreCardQuestions.map((sq: ExtendedScoreCardQuestion) => {
        return {
          id: sq?.id,
          title: sq.cardQuestion?.name,
          description: "",
          renderContent: (
            <>
              <div className="flex flex-col space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex justify-between">
                    {!sq.cardQuestion.factory ? (
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800"
                        onClick={(e) => {
                          e.preventDefault()
                          setCardQuestionToEdit(sq.cardQuestion)
                          setOpenAddNewCardQuestion(true)
                        }}
                      >
                        {sq.cardQuestion.name}
                      </a>
                    ) : (
                      // <Link
                      //   href={Routes.SingleCardQuestionPage({ slug: sq.cardQuestion.slug })}
                      //   passHref
                      // >
                      //   <a
                      //     data-testid={`cardQuestionlink`}
                      //     className="text-theme-600 hover:text-theme-900"
                      //   >
                      //     {sq.cardQuestion.name}
                      //   </a>
                      // </Link>
                      sq.cardQuestion.name
                    )}
                  </div>
                  {!sq.cardQuestion.factory && (
                    <div className="absolute top-0.5 right-0">
                      <button
                        className="float-right text-red-600 hover:text-red-800"
                        title="Remove Question"
                        onClick={async (e) => {
                          e.preventDefault()

                          setScoreCardQuestionToRemove(sq)
                          setOpenConfirm(true)
                        }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {sq.allowBehaviourEdit && <div className="border-b-2 border-neutral-50" />}
                {sq.allowBehaviourEdit && (
                  <div>
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name={`scoreCardQuestion-${sq.id}-behaviour`}
                        paddingX={3}
                        paddingY={1}
                        defaultValue={sq?.behaviour || ScoreCardQuestionBehaviour.OPTIONAL}
                        value={sq?.behaviour}
                        options={Object.keys(ScoreCardQuestionBehaviour).map(
                          (scoreCardQuestionBehaviour) => {
                            return {
                              label: scoreCardQuestionBehaviour,
                              value: scoreCardQuestionBehaviour,
                            }
                          }
                        )}
                        onChange={async (value) => {
                          const toastId = toast.loading(() => (
                            <span>
                              <b>Setting behaviour as {value}</b>
                              <br />
                              for question - {sq.cardQuestion.name}
                            </span>
                          ))
                          try {
                            await updateScoreCardQuestionMutation({
                              where: { id: sq?.id },
                              data: {
                                order: sq.order,
                                behaviour: value,
                              },
                            })
                            toast.success(
                              () => (
                                <span>
                                  <b>Behaviour changed successfully</b>
                                  <br />
                                  for question - {sq?.cardQuestion?.name}
                                </span>
                              ),
                              { id: toastId }
                            )
                            sq.behaviour = value
                            setData([...scoreCardQuestions])
                          } catch (error) {
                            toast.error(
                              "Sorry, we had an unexpected error. Please try again. - " +
                                error.toString(),
                              { id: toastId }
                            )
                          }
                        }}
                      />
                    </Form>
                  </div>
                )}
              </div>
            </>
          ),
        }
      }) as CardType[]
    },
    [updateScoreCardQuestionMutation]
  )

  const [cards, setCards] = useState(getCards(data))
  useEffect(() => {
    setCards(getCards(data))
  }, [data, getCards])

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
        page: 0,
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
      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={
          Object.entries(scoreCardQuestionToRemove).length
            ? `Remove Question - ${scoreCardQuestionToRemove.cardQuestion.name}?`
            : "Remove Question?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing Question {scoreCardQuestionToRemove.cardQuestion.name}</span>
          ))
          try {
            await removeCardQuestionFromScoreCardMutation({
              scoreCardId: scoreCardQuestionToRemove.scoreCardId,
              order: scoreCardQuestionToRemove.order,
            })
            toast.success(
              () => <span>Question removed - {scoreCardQuestionToRemove.cardQuestion.name}</span>,
              {
                id: toastId,
              }
            )
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              { id: toastId }
            )
          }
          router.reload()
        }}
      >
        Are you sure you want to remove this Question from the Score Card?
      </Confirm>
      <div className="w-full flex flex-wrap md:flex-nowrap lg:flex-nowrap space-y-6 md:space-y-0 lg:space-y-0 md:space-x-8 lg:space-x-8">
        <div className="w-full md:w-1/2 lg:w-2/3 p-3 border-2 border-theme-400 rounded">
          <Cards
            noSearch={true}
            cards={cards}
            setCards={() => {}}
            noPagination={true}
            mutateCardDropDB={async (source, destination, draggableId) => {
              if (!(source && destination)) return
              if (source.index === destination.index) return

              // Don't allow drag for 1st and last index since Sourced & Hired can't be changed
              if (
                source.index < factoryScoreCardQuestions.length ||
                destination.index < factoryScoreCardQuestions.length
              ) {
                toast.error("Order for Factory Questions can't be changed")
                return
              }

              const scoreCardQuestion = data?.find((fq) => fq.id === draggableId)

              if (scoreCardQuestion) {
                data?.splice(source?.index, 1)
                data?.splice(destination?.index, 0, scoreCardQuestion)
              }

              setData([...data])

              const toastId = toast.loading(() => (
                <span>Changing cardQuestion order for {scoreCardQuestion?.cardQuestion.name}</span>
              ))
              try {
                await shiftScoreCardQuestionMutation({
                  scoreCardId: scoreCardQuestion?.scoreCardId!,
                  sourceOrder: source?.index + 1,
                  destOrder: destination?.index + 1,
                })

                toast.success(
                  () => (
                    <span>
                      Order changed from {source?.index + 1} to {destination?.index + 1} for
                      Question {scoreCardQuestion?.cardQuestion.name}
                    </span>
                  ),
                  { id: toastId }
                )
              } catch (error) {
                toast.error(
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                  { id: toastId }
                )
              }
            }}
            droppableName="cardQuestions"
            isDragDisabled={false}
            direction={DragDirection.VERTICAL}
            isFull={true}
          />
          {/* <Table
            noSearch={true}
            columns={columns}
            data={data}
            pageCount={scoreCardQuestions.length}
            pageIndex={tablePage}
            pageSize={ITEMS_PER_PAGE}
            hasNext={false}
            hasPrevious={false}
            totalCount={scoreCardQuestions.length}
            startPage={1}
            endPage={1}
            noPagination={true}
            noMarginRight={true}
          /> */}
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 flex justify-end">
          <div
            className={`w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl sticky top-0`}
          >
            <div className="w-full h-full rounded-2xl">
              <ScoreCard
                header="Score Card"
                subHeader="Preview"
                scoreCardId={scoreCard?.id!}
                preview={true}
                onSubmit={async (values) => {
                  toast.error("Can't submit the score in preview mode")
                }}
                scoreCardQuestions={data}
                userId={user?.id || 0}
                companyId={companyId || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const SingleScoreCardPage = ({
  user,
  scoreCard,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddExistingCardQuestions, setOpenAddExistingCardQuestions] = React.useState(false)
  const [openAddNewCardQuestion, setOpenAddNewCardQuestion] = React.useState(false)
  // const [openPreviewScoreCard, setOpenPreviewScoreCard] = React.useState(false)
  const [createScoreCardQuestionMutation] = useMutation(createScoreCardQuestion)
  const [addExistingScoreCardQuestionsMutation] = useMutation(addExistingScoreCardQuestions)
  const [createCardQuestionMutation] = useMutation(createCardQuestion)
  const [addNewCardQuestionToScoreCardMutation] = useMutation(addNewCardQuestionToScoreCard)
  const [cardQuestionToEdit, setCardQuestionToEdit] = useState(null as CardQuestion | null)
  const [updateCardQuestionMutation] = useMutation(updateCardQuestion)
  const router = useRouter()
  const session = useSession()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br className="block md:hidden lg:hidden" />
      {canUpdate && (
        <div className="space-y-6">
          <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
            <div className="space-x-8 flex flex-row justify-between">
              {/* <Modal header="Preview ScoreCard" open={openPreviewScoreCard} setOpen={setOpenPreviewScoreCard}>
                <ScoreCard
                  header="Job Application ScoreCard"
                  subHeader="Preview"
                  scoreCardId={scoreCard?.id!}
                  preview={true}
                  onSubmit={async (values) => {
                    toast.error("Can't submit the scoreCard in preview mode")
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpenPreviewScoreCard(true)
                }}
                data-testid={`open-previewScoreCard-modal`}
                className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
              >
                Preview ScoreCard
              </button> */}

              <Link href={Routes.CardQuestionsHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Question Pool
                </a>
              </Link>

              <Link href={Routes.ScoreCardSettingsPage({ slug: scoreCard?.slug! })} passHref>
                <a
                  className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
                  data-testid={`${scoreCard?.name && `${scoreCard?.name}-`}settingsLink`}
                >
                  Score Card Settings
                </a>
              </Link>
            </div>

            <div className="flex flex-row justify-between space-x-3">
              <Modal
                header="Add CardQuestions from Pool"
                open={openAddExistingCardQuestions}
                setOpen={setOpenAddExistingCardQuestions}
              >
                <AddExistingCardQuestionsForm
                  schema={ScoreCardQuestions}
                  user={user}
                  companyId={session.companyId || 0}
                  scoreCardId={scoreCard?.id!}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding CardQuestion(s)</span>)
                    try {
                      await addExistingScoreCardQuestionsMutation({
                        scoreCardId: scoreCard?.id as string,
                        cardQuestionIds: values.cardQuestionIds,
                      })
                      toast.success(() => <span>CardQuestion(s) added</span>, {
                        id: toastId,
                      })
                      router.reload()
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                        { id: toastId }
                      )
                    }
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpenAddExistingCardQuestions(true)
                }}
                data-testid={`open-addCardQuestion-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add Questions from Pool
              </button>

              <Modal
                header="Add New Question"
                open={openAddNewCardQuestion}
                setOpen={setOpenAddNewCardQuestion}
              >
                <CardQuestionForm
                  editmode={cardQuestionToEdit ? true : false}
                  header={`${cardQuestionToEdit ? "Update" : "Add New"} Question`}
                  subHeader="Enter Question details"
                  initialValues={cardQuestionToEdit ? { name: cardQuestionToEdit?.name } : {}}
                  onSubmit={async (values) => {
                    const isEdit = cardQuestionToEdit ? true : false

                    const toastId = toast.loading(
                      isEdit ? "Updating Question" : "Adding New Question"
                    )
                    try {
                      isEdit
                        ? await updateCardQuestionMutation({
                            where: { id: cardQuestionToEdit?.id },
                            data: { ...values },
                            initial: cardQuestionToEdit!,
                          })
                        : await addNewCardQuestionToScoreCardMutation({
                            scoreCardId: scoreCard?.id,
                            ...values,
                          })
                      await invalidateQuery(getScoreCardQuestionsWOPagination)
                      toast.success(
                        isEdit ? "Question updated successfully" : "Question added successfully",
                        {
                          id: toastId,
                        }
                      )
                      setCardQuestionToEdit(null)
                      setOpenAddNewCardQuestion(false)
                    } catch (error) {
                      toast.error(
                        `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                        { id: toastId }
                      )
                    }
                  }}
                  // onSubmit={async (values) => {
                  //   const toastId = toast.loading(() => <span>Adding Question</span>)
                  //   try {
                  //     await addNewCardQuestionToScoreCardMutation({
                  //       ...values,
                  //       scoreCardId: scoreCard?.id as string,
                  //     })
                  //     toast.success(() => <span>Question added</span>, {
                  //       id: toastId,
                  //     })
                  //     router.reload()
                  //   } catch (error) {
                  //     toast.error(
                  //       "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                  //     )
                  //   }
                  // }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setCardQuestionToEdit(null)
                  setOpenAddNewCardQuestion(true)
                }}
                data-testid={`open-addCardQuestion-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add New Question
              </button>
            </div>
          </div>

          <Suspense
            fallback={
              <Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />
            }
          >
            <CardQuestions
              companyId={session.companyId || 0}
              scoreCard={scoreCard}
              user={user}
              setCardQuestionToEdit={setCardQuestionToEdit}
              setOpenAddNewCardQuestion={setOpenAddNewCardQuestion}
            />
          </Suspense>
        </div>
      )}
    </AuthLayout>
  )
}

export default SingleScoreCardPage
