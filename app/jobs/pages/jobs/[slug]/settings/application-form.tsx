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
import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import toast from "react-hot-toast"
import createFormQuestion from "app/form-questions/mutations/createFormQuestion"
import { ArrowUpIcon, ArrowDownIcon, XCircleIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedFormQuestion, ShiftDirection } from "types"
import shiftFormQuestion from "app/form-questions/mutations/shiftFormQuestion"
import Confirm from "app/core/components/Confirm"
import removeFormQuestionFromJob from "app/form-questions/mutations/removeFormQuestionFromJob"
import ApplicationForm from "app/candidates/components/ApplicationForm"
import { Behaviour, FormQuestion, FormQuestionOption, FormQuestionType } from "@prisma/client"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import Form from "app/core/components/Form"
import updateFormQuestion from "app/form-questions/mutations/updateFormQuestion"
import QuestionForm from "app/form-questions/components/QuestionForm"
import addNewQuestionToForm from "app/form-questions/mutations/addNewQuestionToForm"
import Cards from "app/core/components/Cards"
import Debouncer from "app/core/utils/debouncer"
import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"
import getJobApplicationFormQuestions from "app/form-questions/queries/getJobApplicationFormQuestions"
import updateFormQuestionOrderBehaviour from "app/form-questions/mutations/updateFormQuestionBehaviour"
import updateFormQuestionBehaviour from "app/form-questions/mutations/updateFormQuestionBehaviour"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  // const { can: canUpdate } = await Guard.can(
  //   "update",
  //   "form",
  //   { session },
  //   {
  //     where: {
  //       slug: context?.params?.slug!,
  //       companyId: session?.companyId || "0",
  //     },
  //   }
  // )

  if (user) {
    try {
      // const form = await invokeWithMiddleware(
      //   getForm,
      //   {
      //     where: {
      //       slug: context?.params?.slug!,
      //       companyId: session?.companyId || "0",
      //     },
      //   },
      //   { ...context }
      // )

      const job = await invokeWithMiddleware(
        getJob,
        {
          where: { slug: context?.params?.slug || "0", companyId: session?.companyId || "0" },
        },
        { ...context }
      )

      return {
        props: {
          user,
          job,
          // canUpdate: canUpdate,
          // form: form,
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

export const JobApplicationForm = ({ job, user, setQuestionToEdit, setOpenAddNewQuestion }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedFormQuestion[]>([])
  const [query, setQuery] = useState({})
  const [shiftFormQuestionMutation] = useMutation(shiftFormQuestion)
  const [updateFormQuestionMutation] = useMutation(updateFormQuestion)
  const [updateFormQuestionBehaviourMutation] = useMutation(updateFormQuestionBehaviour)
  const [removeFormQuestionFromJobMutation] = useMutation(removeFormQuestionFromJob)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [formQuestionToRemove, setFormQuestionToRemove] = React.useState(
    null as ExtendedFormQuestion | null
  )

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

  const [formQuestions] = useQuery(getJobApplicationFormQuestions, {
    where: {
      jobId: job?.id || "0",
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
    (formQuestions: ExtendedFormQuestion[]) => {
      return formQuestions?.map((question) => {
        return {
          id: question?.id,
          title: question?.title,
          description: "",
          renderContent: (
            <>
              <div className="flex flex-col space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex justify-between">
                    {question.allowEdit ? (
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
                          setQuestionToEdit(question)
                          setOpenAddNewQuestion(true)
                        }}
                      >
                        {question.title}
                      </a>
                    ) : (
                      question.title
                    )}
                  </div>
                  {question.allowEdit && (
                    <div className="absolute top-0.5 right-0">
                      <button
                        className="float-right text-red-600 hover:text-red-800"
                        title="Remove Question"
                        onClick={async (e) => {
                          e.preventDefault()

                          setFormQuestionToRemove(question)
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
                  {question?.type?.toString().replaceAll("_", " ")}
                </div>

                {question.allowBehaviourEdit && <div className="border-b-2 border-neutral-50" />}
                {question.allowBehaviourEdit && (
                  <div>
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name={`formQuestion-${question.id}-behaviour`}
                        paddingX={3}
                        paddingY={1}
                        defaultValue={question?.behaviour || Behaviour.OPTIONAL}
                        value={question?.behaviour}
                        options={Object.keys(Behaviour).map((formQuestionBehaviour) => {
                          return { label: formQuestionBehaviour, value: formQuestionBehaviour }
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
                            await updateFormQuestionBehaviourMutation({
                              where: { id: question?.id },
                              data: {
                                title: question?.title,
                                type: question?.type,
                                behaviour: value,
                              },
                            })
                            await invalidateQuery(getJobApplicationFormQuestions)
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
                            question.behaviour = value
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
            ? `Remove Question - ${formQuestionToRemove?.title}?`
            : "Remove Question?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing Question {formQuestionToRemove?.title}</span>
          ))
          try {
            if (!formQuestionToRemove) {
              throw new Error("No question set to remove")
            }
            await removeFormQuestionFromJobMutation({
              jobId: formQuestionToRemove.jobId,
              order: formQuestionToRemove.order,
            })
            invalidateQuery(getJobApplicationFormQuestions)
            toast.success(() => <span>Question removed - {formQuestionToRemove?.title}</span>, {
              id: toastId,
            })
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

              // Don't allow drag for first 3 index (name, email & resume)
              if (source.index < 3 || destination.index < 3) {
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
                <span>Changing question order for {formQuestion?.title}</span>
              ))
              try {
                await shiftFormQuestionMutation({
                  jobId: formQuestion?.jobId!,
                  sourceOrder: source?.index + 1,
                  destOrder: destination?.index + 1,
                })
                await invalidateQuery(getJobApplicationFormQuestions)
                toast.success(
                  () => (
                    <span>
                      Order changed from {source?.index + 1} to {destination?.index + 1} for
                      Question {formQuestion?.title}
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
                jobId={job?.id!}
                preview={true}
                onSubmit={async (values) => {
                  toast.error("Can't submit the form in preview mode")
                }}
                // formQuestions={data}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const JobSettingsApplicationFormPage = ({
  user,
  job,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddExistingQuestions, setOpenAddExistingQuestions] = React.useState(false)
  const [openAddNewQuestion, setOpenAddNewQuestion] = React.useState(false)
  const [openPreviewForm, setOpenPreviewForm] = React.useState(false)
  const [createFormQuestionMutation] = useMutation(createFormQuestion)
  // const [createQuestionMutation] = useMutation(createQuestion)
  const [addNewQuestionToFormMutation] = useMutation(addNewQuestionToForm)
  const [questionToEdit, setQuestionToEdit] = useState(
    null as any as FormQuestion & { options: FormQuestionOption[] }
  )
  const [updateFormQuestionMutation] = useMutation(updateFormQuestion)
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Application Form | hire.win" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={job!}>
        <br className="block md:hidden lg:hidden" />
        <div className="space-y-6">
          <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
            <div className="flex flex-row justify-between space-x-3">
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
                          title: questionToEdit?.title,
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
                        ? await updateFormQuestionMutation({
                            where: { id: questionToEdit.id },
                            data: { ...values },
                          })
                        : await addNewQuestionToFormMutation({ jobId: job?.id || "0", ...values })
                      await invalidateQuery(getJobApplicationFormQuestions)
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
            <JobApplicationForm
              job={job}
              user={user}
              setQuestionToEdit={setQuestionToEdit}
              setOpenAddNewQuestion={setOpenAddNewQuestion}
            />
          </Suspense>
        </div>
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsApplicationFormPage
