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
  invalidateQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getForm from "app/forms/queries/getForm"

import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import getFormQuestions from "app/forms/queries/getFormQuestions"
import AddExistingQuestionsForm from "app/forms/components/AddExistingQuestionsForm"
import toast from "react-hot-toast"
import createFormQuestion from "app/forms/mutations/createFormQuestion"
import { FormQuestion, FormQuestions } from "app/forms/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedFormQuestion, ShiftDirection } from "types"
import shiftFormQuestion from "app/forms/mutations/shiftFormQuestion"
import Confirm from "app/core/components/Confirm"
import removeQuestionFromForm from "app/forms/mutations/removeQuestionFromForm"
import ApplicationForm from "app/candidates/components/ApplicationForm"
import { Behaviour, Question, QuestionOption, QuestionType } from "@prisma/client"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import Form from "app/core/components/Form"
import updateFormQuestion from "app/forms/mutations/updateFormQuestion"
import factoryFormQuestions from "app/questions/utils/factoryFormQuestions"
import getFormQuestionsWOPagination from "app/forms/queries/getFormQuestionsWOPagination"
import QuestionForm from "app/questions/components/QuestionForm"
import createQuestion from "app/questions/mutations/createQuestion"
import addExistingFormQuestions from "app/forms/mutations/addExistingFormQuestions"
import addNewQuestionToForm from "app/forms/mutations/addNewQuestionToForm"
import Cards from "app/core/components/Cards"
import Debouncer from "app/core/utils/debouncer"
import updateQuestion from "app/questions/mutations/updateQuestion"

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
    "form",
    { session },
    {
      where: {
        slug: context?.params?.slug!,
        companyId: session?.companyId || "0",
      },
    }
  )

  if (user) {
    try {
      const form = await invokeWithMiddleware(
        getForm,
        {
          where: {
            slug: context?.params?.slug!,
            companyId: session?.companyId || "0",
          },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          form: form,
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
        destination: `/login?next=/forms/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

export const Questions = ({ user, form, setQuestionToEdit, setOpenAddNewQuestion }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedFormQuestion[]>([])
  const [query, setQuery] = useState({})
  const [shiftFormQuestionMutation] = useMutation(shiftFormQuestion)
  const [updateFormQuestionMutation] = useMutation(updateFormQuestion)
  const [removeQuestionFromFormMutation] = useMutation(removeQuestionFromForm)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [formQuestionToRemove, setFormQuestionToRemove] = React.useState(
    null as ExtendedFormQuestion | null
  )

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            question: {
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

  // const [{ formQuestions, hasMore, count }] = usePaginatedQuery(getFormQuestions, {
  //   where: {
  //     formId: form?.id,
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

  const [formQuestions] = useQuery(getFormQuestionsWOPagination, {
    where: {
      formId: form?.id,
      ...query,
    },
    orderBy: { order: "asc" },
  })

  useMemo(async () => {
    let data: ExtendedFormQuestion[] = []

    await formQuestions?.forEach((formQuestion) => {
      data = [...data, { ...formQuestion }]
      setData(data)
    })
  }, [formQuestions])

  const getCards = useCallback(
    (formQuestions) => {
      return formQuestions?.map((fq) => {
        return {
          id: fq?.id,
          title: fq.question?.name,
          description: "",
          renderContent: (
            <>
              <div className="flex flex-col space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex justify-between">
                    {!fq.question.factory ? (
                      // <Link prefetch={true} href={Routes.SingleQuestionPage({ slug: fq.question.slug })} passHref>
                      //   <a
                      //     data-testid={`questionlink`}
                      //     className="text-theme-600 hover:text-theme-900"
                      //   >
                      //     {fq.question.name}
                      //   </a>
                      // </Link>
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 truncate"
                        onClick={(e) => {
                          e.preventDefault()
                          setQuestionToEdit(fq.question)
                          setOpenAddNewQuestion(true)
                        }}
                      >
                        {fq.question.name}
                      </a>
                    ) : (
                      fq.question.name
                    )}
                  </div>
                  {!fq.question.factory && (
                    <div className="absolute top-0.5 right-0">
                      <button
                        className="float-right text-red-600 hover:text-red-800"
                        title="Remove Question"
                        onClick={async (e) => {
                          e.preventDefault()

                          setFormQuestionToRemove(fq)
                          setOpenConfirm(true)
                        }}
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-b-2 border-neutral-50" />

                <div className="text-sm text-neutral-500 font-semibold">
                  {fq.question?.type?.toString().replaceAll("_", " ")}
                </div>

                {fq.allowBehaviourEdit && <div className="border-b-2 border-neutral-50" />}
                {fq.allowBehaviourEdit && (
                  <div>
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name={`formQuestion-${fq.id}-behaviour`}
                        paddingX={3}
                        paddingY={1}
                        defaultValue={fq?.behaviour || Behaviour.OPTIONAL}
                        value={fq?.behaviour}
                        options={Object.keys(Behaviour).map((formQuestionBehaviour) => {
                          return { label: formQuestionBehaviour, value: formQuestionBehaviour }
                        })}
                        onChange={async (value) => {
                          const toastId = toast.loading(() => (
                            <span>
                              <b>Setting behaviour as {value}</b>
                              <br />
                              for question - {fq.question.name}
                            </span>
                          ))
                          try {
                            await updateFormQuestionMutation({
                              where: { id: fq?.id },
                              data: {
                                order: fq.order,
                                behaviour: value,
                              },
                            })
                            toast.success(
                              () => (
                                <span>
                                  <b>Behaviour changed successfully</b>
                                  <br />
                                  for question - {fq?.question?.name}
                                </span>
                              ),
                              { id: toastId }
                            )
                            fq.behaviour = value
                            setData([...formQuestions])
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
    [updateFormQuestionMutation]
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
          formQuestionToRemove
            ? `Remove Question - ${formQuestionToRemove.question?.name}?`
            : "Remove Question?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing Question {formQuestionToRemove?.question?.name}</span>
          ))
          try {
            if (!formQuestionToRemove) {
              throw new Error("No question set to remove")
            }
            await removeQuestionFromFormMutation({
              formId: formQuestionToRemove.formId,
              order: formQuestionToRemove.order,
            })
            invalidateQuery(getFormQuestionsWOPagination)
            toast.success(
              () => <span>Question removed - {formQuestionToRemove.question.name}</span>,
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
          setFormQuestionToRemove(null)
        }}
      >
        Are you sure you want to remove this question from the form?
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
                source.index < factoryFormQuestions?.length ||
                destination.index < factoryFormQuestions?.length
              ) {
                toast.error("Order for Factory Questions can't be changed")
                return
              }

              const formQuestion = data?.find((fq) => fq.id === draggableId)

              if (formQuestion) {
                data?.splice(source?.index, 1)
                data?.splice(destination?.index, 0, formQuestion)
              }

              setData([...data])

              const toastId = toast.loading(() => (
                <span>Changing question order for {formQuestion?.question.name}</span>
              ))
              try {
                await shiftFormQuestionMutation({
                  formId: formQuestion?.formId!,
                  sourceOrder: source?.index + 1,
                  destOrder: destination?.index + 1,
                })

                toast.success(
                  () => (
                    <span>
                      Order changed from {source?.index + 1} to {destination?.index + 1} for
                      Question {formQuestion?.question.name}
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
            droppableName="questions"
            isDragDisabled={false}
            direction={DragDirection.VERTICAL}
            isFull={true}
          />
          {/* <Table
            noSearch={true}
            columns={columns}
            data={data}
            pageCount={formQuestions?.length}
            pageIndex={tablePage}
            pageSize={ITEMS_PER_PAGE}
            hasNext={false}
            hasPrevious={false}
            totalCount={formQuestions?.length}
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
            {/* <div className="bg-neutral-400 rounded-b-2xl h-8 w-1/2 absolute left-1/4 top-0" /> */}
            {/* <div className="border-2 border-neutral-400 rounded-2xl h-2 w-1/3 absolute left-1/3 top-2" /> */}
            <div className="w-full h-full rounded-2xl">
              <ApplicationForm
                header="Job Application Form"
                subHeader="Preview"
                formId={form?.id!}
                preview={true}
                onSubmit={async (values) => {
                  toast.error("Can't submit the form in preview mode")
                }}
                formQuestions={data}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const SingleFormPage = ({
  user,
  form,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddExistingQuestions, setOpenAddExistingQuestions] = React.useState(false)
  const [openAddNewQuestion, setOpenAddNewQuestion] = React.useState(false)
  const [openPreviewForm, setOpenPreviewForm] = React.useState(false)
  const [createFormQuestionMutation] = useMutation(createFormQuestion)
  const [addExistingFormQuestionsMutation] = useMutation(addExistingFormQuestions)
  const [createQuestionMutation] = useMutation(createQuestion)
  const [addNewQuestionToFormMutation] = useMutation(addNewQuestionToForm)
  const [questionToEdit, setQuestionToEdit] = useState(
    null as any as Question & { options: QuestionOption[] }
  )
  const [updateQuestionMutation] = useMutation(updateQuestion)
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
            <div className="space-x-8 flex flex-row justify-center">
              <Link prefetch={true} href={Routes.QuestionsHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Question Pool
                </a>
              </Link>

              {/* <Link prefetch={true} href={Routes.FormSettingsPage({ slug: form?.slug! })} passHref>
                <a
                  className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
                  data-testid={`${form?.name && `${form?.name}-`}settingsLink`}
                >
                  Form Settings
                </a>
              </Link> */}
            </div>

            <div className="flex flex-row justify-between space-x-3">
              <Modal
                header="Add Questions from Pool"
                open={openAddExistingQuestions}
                setOpen={setOpenAddExistingQuestions}
                noOverflow={true}
              >
                <AddExistingQuestionsForm
                  schema={FormQuestions}
                  user={user}
                  formId={form?.id!}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding Question(s)</span>)
                    try {
                      await addExistingFormQuestionsMutation({
                        formId: form?.id as string,
                        questionIds: values.questionIds,
                      })
                      invalidateQuery(getFormQuestionsWOPagination)
                      toast.success(() => <span>Question(s) added</span>, {
                        id: toastId,
                      })
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                        { id: toastId }
                      )
                    }
                    setOpenAddExistingQuestions(false)
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpenAddExistingQuestions(true)
                }}
                data-testid={`open-addQuestion-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add Questions from Pool
              </button>

              <Modal
                header="Add New Question"
                open={openAddNewQuestion}
                setOpen={setOpenAddNewQuestion}
              >
                <QuestionForm
                  editmode={questionToEdit ? true : false}
                  header={`${questionToEdit ? "Update" : "Add New"} Question`}
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

                    const toastId = toast.loading(
                      isEdit ? "Updating Question" : "Creating Question"
                    )
                    try {
                      isEdit
                        ? await updateQuestionMutation({
                            where: { id: questionToEdit.id },
                            data: { ...values },
                            initial: questionToEdit,
                          })
                        : await addNewQuestionToFormMutation({ formId: form?.id, ...values })
                      await invalidateQuery(getFormQuestionsWOPagination)
                      toast.success(
                        isEdit ? "Question updated successfully" : "Question added successfully",
                        {
                          id: toastId,
                        }
                      )
                      setQuestionToEdit(null as any)
                      setOpenAddNewQuestion(false)
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
                  //     await addNewQuestionToFormMutation({
                  //       ...values,
                  //       formId: form?.id as string,
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
                  setQuestionToEdit(null as any)
                  setOpenAddNewQuestion(true)
                }}
                data-testid={`open-addQuestion-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add New Question
              </button>
            </div>
          </div>

          <Suspense fallback={<p className="pt-3">Loading...</p>}>
            <Questions
              form={form}
              user={user}
              setQuestionToEdit={setQuestionToEdit}
              setOpenAddNewQuestion={setOpenAddNewQuestion}
            />
          </Suspense>
        </div>
      )}
    </AuthLayout>
  )
}

export default SingleFormPage
