import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useRouter } from "next/router"
import { getSession, useSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"

import { usePaginatedQuery, useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"

import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import path from "path"
import Guard from "src/guard/ability"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"

import Modal from "src/core/components/Modal"
import Table from "src/core/components/Table"
// import AddExistingCardQuestionsForm from "src/score-cards/components/AddExistingCardQuestionsForm"
import toast from "react-hot-toast"

import {
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
  TrashIcon,
  XIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedScoreCardQuestion, ShiftDirection } from "types"
import shiftScoreCardQuestion from "src/score-cards/mutations/shiftScoreCardQuestion"
import Confirm from "src/core/components/Confirm"
import removeCardQuestionFromScoreCard from "src/score-cards/mutations/removeCardQuestionFromScoreCard"
import ScoreCard from "src/score-cards/components/ScoreCard"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import Form from "src/core/components/Form"
import updateScoreCardQuestionBehaviour from "src/score-cards/mutations/updateScoreCardQuestionBehaviour"
// import getScoreCardQuestions from "src/score-cards/queries/getScoreCardQuestions"
import CardQuestionForm from "src/score-cards/components/ScoreCardQuestionForm"
import addNewCardQuestionToScoreCard from "src/score-cards/mutations/addNewCardQuestionToScoreCard"
import Cards from "src/core/components/Cards"
import Debouncer from "src/core/utils/debouncer"
import { ScoreCardQuestion, Behaviour } from "@prisma/client"
import updateScoreCardQuestionName from "src/score-cards/mutations/updateScoreCardQuestionName"
import getScoreCardQuestions from "src/score-cards/queries/getScoreCardQuestions"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import getJob from "src/jobs/queries/getJob"
import getStage from "src/stages/queries/getStage"
import { AuthorizationError } from "blitz"
import { PencilIcon } from "@heroicons/react/solid"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  //   const { can: canUpdate } = await Guard.can(
  //     "update",
  //     "scoreCard",
  //     { session },
  //     {
  //       where: {
  //         slug: context?.params?.slug!,
  //         companyId: session?.companyId || "0",
  //       },
  //     }
  //   )

  const job = await getJob(
    {
      where: {
        slug: (context?.params?.slug as string) || "0",
        companyId: session?.companyId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && job) {
    try {
      //   const scoreCard = await invokeWithMiddleware(
      //     getScoreCard,
      //     {
      //       where: {
      //         slug: context?.params?.slug!,
      //         companyId: session?.companyId || "0",
      //       },
      //     },
      //     { ...context }
      //   )
      const stage = await getStage(
        { where: { slug: (context?.params?.stageSlug as string) || "0", jobId: job.id } },
        { ...context.ctx }
      )

      return {
        props: {
          user: user,
          job,
          stage: stage || null,
          //   canUpdate: canUpdate,
          //   scoreCard: scoreCard,
        } as any,
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
        destination: `/auth/login?next=/scoreCards/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

export const CardQuestions = ({
  user,
  stage,
  setCardQuestionToEdit,
  setOpenAddNewCardQuestion,
}) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedScoreCardQuestion[]>([])
  const [query, setQuery] = useState({})
  const [shiftScoreCardQuestionMutation] = useMutation(shiftScoreCardQuestion)
  const [updateScoreCardQuestionBehaviourMutation] = useMutation(updateScoreCardQuestionBehaviour)
  const [removeCardQuestionFromScoreCardMutation] = useMutation(removeCardQuestionFromScoreCard)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [scoreCardQuestionToRemove, setScoreCardQuestionToRemove] = React.useState(
    null as ExtendedScoreCardQuestion | null
  )

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            title: {
              contains: JSON.parse(router.query.search as string),
              mode: "insensitive",
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

  const [scoreCardQuestions] = useQuery(getScoreCardQuestions, {
    where: {
      stageId: stage?.id || "0",
      ...query,
    },
    orderBy: { order: "asc" },
  })

  useMemo(async () => {
    let data: ExtendedScoreCardQuestion[] = []

    await scoreCardQuestions?.forEach((scoreCardQuestion) => {
      data = [...data, { ...(scoreCardQuestion as any) }]
      setData(data)
    })
  }, [scoreCardQuestions])

  const getCards = useCallback(
    (scoreCardQuestions) => {
      return scoreCardQuestions?.map((question: ExtendedScoreCardQuestion) => {
        return {
          id: question?.id,
          title: question?.title,
          description: "",
          renderContent: (
            <>
              <div className="flex flex-col space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex justify-between">
                    <div className="pr-12 text-neutral-700 truncate">{question.title}</div>
                    {/* {question.allowEdit ? (
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 truncate"
                        onClick={(e) => {
                          e.preventDefault()
                          setCardQuestionToEdit(question)
                          setOpenAddNewCardQuestion(true)
                        }}
                      >
                        {question.title}
                      </a>
                    ) : (
                      question.title
                    )} */}
                  </div>
                  {question.allowEdit && scoreCardQuestions?.length > 1 && (
                    <>
                      <div className="absolute top-0.5 right-0">
                        <button
                          className="float-right text-red-600 hover:text-red-800"
                          title="Delete Question"
                          onClick={async (e) => {
                            e.preventDefault()
                            setScoreCardQuestionToRemove(question)
                            setOpenConfirm(true)
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="absolute top-0.5 right-6">
                        <button
                          id={"edit-" + question.id}
                          className="float-right text-indigo-600 hover:text-indigo-800"
                          title="Edit Candidate Pool"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setCardQuestionToEdit(question)
                            setOpenAddNewCardQuestion(true)
                          }}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {question.allowBehaviourEdit && <div className="border-b-2 border-neutral-50" />}
                {question.allowBehaviourEdit && (
                  <div>
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name={`scoreCardQuestion-${question.id}-behaviour`}
                        paddingX={3}
                        paddingY={1}
                        defaultValue={question?.behaviour || Behaviour.OPTIONAL}
                        value={question?.behaviour}
                        options={Object.keys(Behaviour).map((scoreCardQuestionBehaviour) => {
                          return {
                            label: scoreCardQuestionBehaviour,
                            value: scoreCardQuestionBehaviour,
                          }
                        })}
                        onChange={async (value) => {
                          const toastId = toast.loading(() => (
                            <span>
                              <b>Setting behaviour as {value}</b>
                              <br />
                              for question - {question.title}
                            </span>
                          ))
                          try {
                            await updateScoreCardQuestionBehaviourMutation({
                              where: { id: question?.id },
                              data: {
                                title: question.title,
                                behaviour: value,
                              },
                            })
                            toast.success(
                              () => (
                                <span>
                                  <b>Behaviour changed successfully</b>
                                  <br />
                                  for question - {question?.title}
                                </span>
                              ),
                              { id: toastId }
                            )
                            // question.behaviour = value
                            // setData([...scoreCardQuestions])
                            invalidateQuery(getScoreCardQuestions)
                            invalidateQuery(getStage)
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
    [updateScoreCardQuestionBehaviourMutation]
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
          scoreCardQuestionToRemove
            ? `Remove Question - ${scoreCardQuestionToRemove?.title}?`
            : "Remove Question?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing Question {scoreCardQuestionToRemove?.title}</span>
          ))
          try {
            if (!scoreCardQuestionToRemove) {
              throw new Error("No question set to delete")
            }
            await removeCardQuestionFromScoreCardMutation({
              stageId: scoreCardQuestionToRemove.stageId,
              slug: scoreCardQuestionToRemove.slug,
            })
            invalidateQuery(getScoreCardQuestions)
            invalidateQuery(getStage)
            toast.success(
              () => <span>Question removed - {scoreCardQuestionToRemove?.title}</span>,
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
          setOpenConfirm(false)
          setScoreCardQuestionToRemove(null)
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

              // // Don't allow drag for 1st and last index since Sourced & Hired can't be changed
              // if (
              //   source.index < factoryScoreCardQuestions?.length ||
              //   destination.index < factoryScoreCardQuestions?.length
              // ) {
              //   toast.error("Order for Factory Questions can't be changed")
              //   return
              // }

              const scoreCardQuestion = data?.find((fq) => fq.id === draggableId)

              if (scoreCardQuestion) {
                data?.splice(source?.index, 1)
                data?.splice(destination?.index, 0, scoreCardQuestion)
              }

              // setData([...data])

              const toastId = toast.loading(() => (
                <span>Changing cardQuestion order for {scoreCardQuestion?.title}</span>
              ))
              try {
                await shiftScoreCardQuestionMutation({
                  stageId: scoreCardQuestion?.stageId!,
                  sourceOrder: source?.index + 1,
                  destOrder: destination?.index + 1,
                })

                toast.success(
                  () => (
                    <span>
                      Order changed from {source?.index + 1} to {destination?.index + 1} for
                      Question {scoreCardQuestion?.title}
                    </span>
                  ),
                  { id: toastId }
                )
                invalidateQuery(getScoreCardQuestions)
                invalidateQuery(getStage)
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
            pageCount={scoreCardQuestions?.length}
            pageIndex={tablePage}
            pageSize={ITEMS_PER_PAGE}
            hasNext={false}
            hasPrevious={false}
            totalCount={scoreCardQuestions?.length}
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
                header="Score Card (Preview)"
                subHeader=""
                stageId={stage?.id || "0"}
                preview={true}
                onSubmit={async (values) => {
                  toast.error("Can't submit the score in preview mode")
                }}
                // scoreCardQuestions={data}
                userId={user?.id || "0"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const JobSettingsSingleScoreCardPage = ({
  user,
  job,
  stage,
  //   scoreCard,
  error,
}: //   canUpdate,
InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddExistingCardQuestions, setOpenAddExistingCardQuestions] = React.useState(false)
  const [openAddNewCardQuestion, setOpenAddNewCardQuestion] = React.useState(false)
  // const [openPreviewScoreCard, setOpenPreviewScoreCard] = React.useState(false)
  const [addNewCardQuestionToScoreCardMutation] = useMutation(addNewCardQuestionToScoreCard)
  const [scoreCardQuestionToEdit, setScoreCardQuestionToEdit] = useState(
    null as ScoreCardQuestion | null
  )
  const [updateScoreCardQuestionNameMutation] = useMutation(updateScoreCardQuestionName)
  const router = useRouter()
  const session = useSession()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Score Card" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          {/* <br className="block md:hidden lg:hidden" /> */}
          <Link legacyBehavior href={Routes.JobSettingsStagesPage({ slug: job?.slug || "0" })}>
            <a className="w-fit flex items-center space-x-2 text-neutral-600 hover:text-black">
              <ArrowLeftIcon className="w-5 h-5" />
              <div>Stages Config</div>
            </a>
          </Link>
          <div className="text-left sm:text-center text-neutral-700 text-xl font-medium">
            Score Card Config for stage {'"'}
            {stage?.name}
            {'"'}
          </div>
          {/* {canUpdate && ( */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
              {/* <div className="space-x-8 flex flex-row justify-center">
              <Modal header="Preview ScoreCard" open={openPreviewScoreCard} setOpen={setOpenPreviewScoreCard}>
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
              </button>

              <Link legacyBehavior prefetch={true} href={Routes.CardQuestionsHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Question Pool
                </a>
              </Link>

              <Link legacyBehavior
                prefetch={true}
                href={Routes.ScoreCardSettingsPage({ slug: scoreCard?.slug! })}
                passHref
              >
                <a
                  className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
                  data-testid={`${scoreCard?.name && `${scoreCard?.name}-`}settingsLink`}
                >
                  Score Card Settings
                </a>
              </Link>
            </div> */}

              <div className="flex flex-row justify-between space-x-3">
                {/* <Modal
                header="Add Questions from Pool"
                open={openAddExistingCardQuestions}
                setOpen={setOpenAddExistingCardQuestions}
                noOverflow={true}
              >
                <AddExistingCardQuestionsForm
                  schema={ScoreCardQuestions}
                  user={user}
                  companyId={session.companyId || "0"}
                  scoreCardId={scoreCard?.id!}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding CardQuestion(s)</span>)
                    try {
                      await addExistingScoreCardQuestionsMutation({
                        scoreCardId: scoreCard?.id as string,
                        cardQuestionIds: values.cardQuestionIds,
                      })
                      invalidateQuery(getScoreCardQuestions)
                      toast.success(() => <span>CardQuestion(s) added</span>, {
                        id: toastId,
                      })
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                        { id: toastId }
                      )
                    }
                    setOpenAddExistingCardQuestions(false)
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
              </button> */}

                <Modal
                  header="Add New Question"
                  open={openAddNewCardQuestion}
                  setOpen={setOpenAddNewCardQuestion}
                >
                  <CardQuestionForm
                    editmode={scoreCardQuestionToEdit ? true : false}
                    header={`${scoreCardQuestionToEdit ? "Update" : "Add New"} Question`}
                    subHeader="Enter Question details"
                    initialValues={
                      scoreCardQuestionToEdit ? { title: scoreCardQuestionToEdit?.title } : {}
                    }
                    onSubmit={async (values) => {
                      const isEdit = scoreCardQuestionToEdit ? true : false

                      const toastId = toast.loading(
                        isEdit ? "Updating Question" : "Adding New Question"
                      )
                      try {
                        isEdit
                          ? await updateScoreCardQuestionNameMutation({
                              where: { id: scoreCardQuestionToEdit?.id },
                              data: { ...values },
                              initial: scoreCardQuestionToEdit!,
                            })
                          : await addNewCardQuestionToScoreCardMutation({
                              stageId: stage?.id || "0",
                              ...values,
                            })
                        invalidateQuery(getScoreCardQuestions)
                        invalidateQuery(getStage)
                        toast.success(
                          isEdit ? "Question updated successfully" : "Question added successfully",
                          {
                            id: toastId,
                          }
                        )
                        setScoreCardQuestionToEdit(null)
                        setOpenAddNewCardQuestion(false)
                      } catch (error) {
                        toast.error(
                          `Failed to ${
                            isEdit ? "update" : "add new"
                          } template - ${error.toString()}`,
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
                    setScoreCardQuestionToEdit(null)
                    setOpenAddNewCardQuestion(true)
                  }}
                  data-testid={`open-addCardQuestion-modal`}
                  className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
                >
                  Add New Question
                </button>
              </div>
            </div>

            <Suspense fallback={<p className="pt-3">Loading...</p>}>
              <CardQuestions
                // companyId={session.companyId || "0"}
                stage={stage}
                user={user}
                setCardQuestionToEdit={setScoreCardQuestionToEdit}
                setOpenAddNewCardQuestion={setOpenAddNewCardQuestion}
              />
            </Suspense>
          </div>
          {/* )} */}
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsSingleScoreCardPage
