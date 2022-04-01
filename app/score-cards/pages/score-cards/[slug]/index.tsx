import React, { Suspense, useEffect, useMemo, useState } from "react"
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
// import ApplicationScoreCard from "app/jobs/components/ApplicationScoreCard"
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
        { where: { slug: context?.params?.slug!, userId: user?.id } },
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

export const CardQuestions = ({ user, scoreCard }) => {
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
      data = [...data, { ...scoreCardQuestion }]
      setData(data)
    })
  }, [scoreCardQuestions])

  // let columns = [
  //   {
  //     Header: "Order",
  //     accessor: "order",
  //   },
  //   {
  //     Header: "Name",
  //     accessor: "cardQuestion.name",
  //     Cell: (props) => {
  //       const scoreCardQuestion: ExtendedScoreCardQuestion = props.cell.row.original

  //       return (
  //         <>
  //           {!scoreCardQuestion.cardQuestion.factory ? (
  //             <Link href={Routes.SingleCardQuestionPage({ slug: scoreCardQuestion.cardQuestion.slug })} passHref>
  //               <a data-testid={`cardQuestionlink`} className="text-theme-600 hover:text-theme-900">
  //                 {scoreCardQuestion.cardQuestion.name}
  //               </a>
  //             </Link>
  //           ) : (
  //             scoreCardQuestion.cardQuestion.name
  //           )}
  //         </>
  //       )
  //     },
  //   },
  //   {
  //     Header: "Type",
  //     accessor: "cardQuestion.type",
  //     Cell: (props) => {
  //       return props.value.toString().replaceAll("_", " ")
  //     },
  //   },
  //   {
  //     Header: "",
  //     accessor: "action",
  //     Cell: (props) => {
  //       const scoreCardQuestion: ExtendedScoreCardQuestion = props.cell.row.original

  //       return (
  //         <>
  //           <div className="flex space-x-8">
  //             {scoreCardQuestion.allowBehaviourEdit && (
  //               <ScoreCard noScoreCardatting={true} onSubmit={async (values) => {}}>
  //                 <LabeledToggleGroupField
  //                   name={`scoreCardQuestion-${scoreCardQuestion.id}-behaviour`}
  //                   paddingX={3}
  //                   paddingY={1}
  //                   defaultValue={scoreCardQuestion?.behaviour || ScoreCardQuestionBehaviour.OPTIONAL}
  //                   value={scoreCardQuestion?.behaviour}
  //                   options={Object.keys(ScoreCardQuestionBehaviour).map((scoreCardQuestionBehaviour) => {
  //                     return { label: scoreCardQuestionBehaviour, value: scoreCardQuestionBehaviour }
  //                   })}
  //                   onChange={async (value) => {
  //                     const toastId = toast.loading(() => (
  //                       <span>
  //                         <b>Setting behaviour as {value}</b>
  //                         <br />
  //                         for cardQuestion - {scoreCardQuestion.cardQuestion.name}
  //                       </span>
  //                     ))
  //                     try {
  //                       await updateScoreCardQuestionMutation({
  //                         where: { id: scoreCardQuestion?.id },
  //                         data: {
  //                           order: scoreCardQuestion.order,
  //                           behaviour: value,
  //                         },
  //                       })
  //                       toast.success(
  //                         () => (
  //                           <span>
  //                             <b>Behaviour changed successfully</b>
  //                             <br />
  //                             for cardQuestion - {scoreCardQuestion?.cardQuestion?.name}
  //                           </span>
  //                         ),
  //                         { id: toastId }
  //                       )
  //                       scoreCardQuestion.behaviour = value
  //                     } catch (error) {
  //                       toast.error(
  //                         "Sorry, we had an unexpected error. Please try again. - " +
  //                           error.toString(),
  //                         { id: toastId }
  //                       )
  //                     }
  //                   }}
  //                 />
  //               </ScoreCard>
  //             )}

  //             {!scoreCardQuestion.cardQuestion.factory && (
  //               <>
  //                 <Confirm
  //                   open={openConfirm}
  //                   setOpen={setOpenConfirm}
  //                   header={
  //                     Object.entries(scoreCardQuestionToRemove).length
  //                       ? `Remove CardQuestion - ${scoreCardQuestionToRemove.cardQuestion.name}?`
  //                       : "Remove CardQuestion?"
  //                   }
  //                   onSuccess={async () => {
  //                     const toastId = toast.loading(() => (
  //                       <span>Removing CardQuestion {scoreCardQuestionToRemove.cardQuestion.name}</span>
  //                     ))
  //                     try {
  //                       await removeCardQuestionFromScoreCardMutation({
  //                         scoreCardId: scoreCardQuestionToRemove.scoreCardId,
  //                         order: scoreCardQuestionToRemove.order,
  //                       })
  //                       toast.success(
  //                         () => (
  //                           <span>CardQuestion removed - {scoreCardQuestionToRemove.cardQuestion.name}</span>
  //                         ),
  //                         {
  //                           id: toastId,
  //                         }
  //                       )
  //                     } catch (error) {
  //                       toast.error(
  //                         "Sorry, we had an unexpected error. Please try again. - " +
  //                           error.toString(),
  //                         { id: toastId }
  //                       )
  //                     }
  //                     router.reload()
  //                   }}
  //                 >
  //                   Are you sure you want to remove this cardQuestion from the scoreCard?
  //                 </Confirm>
  //                 {!scoreCardQuestion.cardQuestion.factory && (
  //                   <button
  //                     title="Remove CardQuestion"
  //                     className="align-middle rounded-full"
  //                     onClick={async (e) => {
  //                       e.preventDefault()

  //                       setScoreCardQuestionToRemove(scoreCardQuestion)
  //                       setOpenConfirm(true)
  //                     }}
  //                   >
  //                     <XCircleIcon className="w-6 h-auto text-red-500 hover:text-red-600" />
  //                   </button>
  //                 )}

  //                 <div className="flex">
  //                   <button
  //                     disabled={scoreCardQuestion.order === scoreCardQuestions.length}
  //                     title="Move Down"
  //                     className="align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
  //                     onClick={async (e) => {
  //                       const toastId = toast.loading(() => (
  //                         <span>Changing cardQuestion order for {scoreCardQuestion.cardQuestion.name}</span>
  //                       ))
  //                       try {
  //                         await shiftScoreCardQuestionMutation({
  //                           scoreCardId: scoreCardQuestion.scoreCardId,
  //                           order: scoreCardQuestion.order,
  //                           shiftDirection: ShiftDirection.DOWN,
  //                         })
  //                         toast.success(
  //                           () => (
  //                             <span>
  //                               Order changed from {scoreCardQuestion.order} to {scoreCardQuestion.order + 1}{" "}
  //                               for CardQuestion {scoreCardQuestion.cardQuestion.name}
  //                             </span>
  //                           ),
  //                           { id: toastId }
  //                         )
  //                         const x = scoreCardQuestion.order
  //                         const y = scoreCardQuestion.order - 1
  //                         if (x <= scoreCardQuestions.length - 1 && y <= scoreCardQuestions.length - 1) {
  //                           const row = scoreCardQuestions[x]!
  //                           scoreCardQuestions[x] = {
  //                             ...scoreCardQuestions[y]!,
  //                             order: scoreCardQuestion.order + 1,
  //                           }
  //                           scoreCardQuestions[y] = { ...row, order: scoreCardQuestion.order }
  //                           setData(scoreCardQuestions)
  //                         } else {
  //                           toast.error("Index out of range")
  //                         }
  //                       } catch (error) {
  //                         toast.error(
  //                           "Sorry, we had an unexpected error. Please try again. - " +
  //                             error.toString(),
  //                           { id: toastId }
  //                         )
  //                       }
  //                     }}
  //                   >
  //                     {!(scoreCardQuestion.order === scoreCardQuestions.length) && (
  //                       <ArrowDownIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
  //                     )}

  //                     {scoreCardQuestion.order === scoreCardQuestions.length && (
  //                       <ArrowDownIcon className="h-5 cursor-not-allowed text-gray-300" />
  //                     )}
  //                   </button>

  //                   <button
  //                     disabled={
  //                       scoreCardQuestion.order === 1 ||
  //                       scoreCardQuestion.order === factoryScoreCardQuestions.length + 1
  //                     }
  //                     title="Move Up"
  //                     className="ml-2 align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
  //                     onClick={async (e) => {
  //                       const toastId = toast.loading(() => (
  //                         <span>Changing cardQuestion order for {scoreCardQuestion.cardQuestion.name}</span>
  //                       ))
  //                       try {
  //                         await shiftScoreCardQuestionMutation({
  //                           scoreCardId: scoreCardQuestion.scoreCardId,
  //                           order: scoreCardQuestion.order,
  //                           shiftDirection: ShiftDirection.UP,
  //                         })
  //                         toast.success(
  //                           () => (
  //                             <span>
  //                               Order changed from {scoreCardQuestion.order} to {scoreCardQuestion.order - 1}{" "}
  //                               for CardQuestion {scoreCardQuestion.cardQuestion.name}
  //                             </span>
  //                           ),
  //                           { id: toastId }
  //                         )
  //                         const x = scoreCardQuestion.order - 1
  //                         const y = scoreCardQuestion.order - 2
  //                         if (x <= scoreCardQuestions.length - 1 && y <= scoreCardQuestions.length - 1) {
  //                           const row = scoreCardQuestions[x]!
  //                           scoreCardQuestions[x] = { ...scoreCardQuestions[y]!, order: scoreCardQuestion.order }
  //                           scoreCardQuestions[y] = { ...row, order: scoreCardQuestion.order - 1 }
  //                           setData(scoreCardQuestions)
  //                         } else {
  //                           toast.error("Index out of range")
  //                         }
  //                       } catch (error) {
  //                         toast.error(
  //                           "Sorry, we had an unexpected error. Please try again. - " +
  //                             error.toString(),
  //                           { id: toastId }
  //                         )
  //                       }
  //                     }}
  //                   >
  //                     {!(
  //                       scoreCardQuestion.order === 1 ||
  //                       scoreCardQuestion.order === factoryScoreCardQuestions.length + 1
  //                     ) && (
  //                       <ArrowUpIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
  //                     )}

  //                     {(scoreCardQuestion.order === 1 ||
  //                       scoreCardQuestion.order === factoryScoreCardQuestions.length + 1) && (
  //                       <ArrowUpIcon className="h-5 cursor-not-allowed text-gray-300" />
  //                     )}
  //                   </button>
  //                 </div>
  //               </>
  //             )}
  //           </div>
  //         </>
  //       )
  //     },
  //   },
  // ]

  const getCards = (scoreCardQuestions) => {
    return scoreCardQuestions.map((fq) => {
      return {
        id: fq?.id,
        title: fq.cardQuestion?.name,
        description: "",
        renderContent: (
          <>
            <div className="flex flex-col space-y-2">
              <div className="w-full relative">
                <div className="font-bold flex justify-between">
                  {!fq.cardQuestion.factory ? (
                    <Link
                      href={Routes.SingleCardQuestionPage({ slug: fq.cardQuestion.slug })}
                      passHref
                    >
                      <a
                        data-testid={`cardQuestionlink`}
                        className="text-theme-600 hover:text-theme-900"
                      >
                        {fq.cardQuestion.name}
                      </a>
                    </Link>
                  ) : (
                    fq.cardQuestion.name
                  )}
                </div>
                {!fq.cardQuestion.factory && (
                  <div className="absolute top-0.5 right-0">
                    <button
                      className="float-right text-red-600 hover:text-red-800"
                      title="Remove CardQuestion"
                      onClick={async (e) => {
                        e.preventDefault()

                        setScoreCardQuestionToRemove(fq)
                        setOpenConfirm(true)
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
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
            ? `Remove CardQuestion - ${scoreCardQuestionToRemove.cardQuestion.name}?`
            : "Remove CardQuestion?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing CardQuestion {scoreCardQuestionToRemove.cardQuestion.name}</span>
          ))
          try {
            await removeCardQuestionFromScoreCardMutation({
              scoreCardId: scoreCardQuestionToRemove.scoreCardId,
              order: scoreCardQuestionToRemove.order,
            })
            toast.success(
              () => (
                <span>CardQuestion removed - {scoreCardQuestionToRemove.cardQuestion.name}</span>
              ),
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
        Are you sure you want to remove this cardQuestion from the scoreCard?
      </Confirm>
      <div className="w-full flex flex-wrap md:flex-nowrap lg:flex-nowrap">
        <div className="w-full lg:w-3/5 p-3 border-2 border-neutral-300 rounded">
          <Cards
            noSearch={true}
            cards={cards}
            setCards={() => {}}
            noPagination={true}
            mutateCardDropDB={async (source, destination, draggableId) => {
              if (!(source && destination)) return

              // Don't allow drag for 1st and last index since Sourced & Hired can't be changed
              if (destination.index < factoryScoreCardQuestions.length) {
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
                      CardQuestion {scoreCardQuestion?.cardQuestion.name}
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
        <div className="w-full lg:w-2/5 hidden lg:flex justify-end">
          <div className="bg-white min-h-screen max-h-screen border-8 border-neutral-300 rounded-3xl sticky top-0">
            {/* <div className="bg-neutral-400 rounded-b-2xl h-8 w-1/2 absolute left-1/4 top-0" /> */}
            {/* <div className="border-2 border-neutral-400 rounded-2xl h-2 w-1/3 absolute left-1/3 top-2" /> */}
            <div className="w-full h-full overflow-auto rounded-3xl">
              {/* <ApplicationScoreCard
                header="Job Application ScoreCard"
                subHeader="Preview"
                scoreCardId={scoreCard?.id!}
                preview={true}
                onSubmit={async (values) => {
                  toast.error("Can't submit the scoreCard in preview mode")
                }}
                scoreCardQuestions={data}
              /> */}
            </div>
            <div className="bg-neutral-300 rounded-2xl h-1 w-1/2 absolute left-1/4 bottom-2" />
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
  const router = useRouter()

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
                <ApplicationScoreCard
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
                  header="Add New Question to Score Card"
                  subHeader="Enter Question details"
                  initialValues={{
                    name: "",
                  }}
                  editmode={false}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding Question</span>)
                    try {
                      await addNewCardQuestionToScoreCardMutation({
                        ...values,
                        scoreCardId: scoreCard?.id as string,
                      })
                      toast.success(() => <span>Question added</span>, {
                        id: toastId,
                      })
                      router.reload()
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                      )
                    }
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
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
            <CardQuestions scoreCard={scoreCard} user={user} />
          </Suspense>
        </div>
      )}
    </AuthLayout>
  )
}

export default SingleScoreCardPage
