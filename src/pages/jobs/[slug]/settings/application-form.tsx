import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useRouter } from "next/router"
import { getSession } from "@blitzjs/auth"
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
import toast from "react-hot-toast"
import createFormQuestion from "src/form-questions/mutations/createFormQuestion"
import { ArrowUpIcon, ArrowDownIcon, XCircleIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedFormQuestion, PlanName, ShiftDirection } from "types"
import shiftFormQuestion from "src/form-questions/mutations/shiftFormQuestion"
import Confirm from "src/core/components/Confirm"
import removeFormQuestionFromJob from "src/form-questions/mutations/removeFormQuestionFromJob"
import ApplicationForm from "src/candidates/components/ApplicationForm"
import { Behaviour, FormQuestion, FormQuestionOption, FormQuestionType } from "@prisma/client"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import Form from "src/core/components/Form"
import updateFormQuestion from "src/form-questions/mutations/updateFormQuestion"
import QuestionForm from "src/form-questions/components/QuestionForm"
import addNewQuestionToForm from "src/form-questions/mutations/addNewQuestionToForm"
import Cards from "src/core/components/Cards"
import Debouncer from "src/core/utils/debouncer"
import getJob from "src/jobs/queries/getJob"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import getJobApplicationFormQuestions from "src/form-questions/queries/getJobApplicationFormQuestions"
import updateFormQuestionOrderBehaviour from "src/form-questions/mutations/updateFormQuestionBehaviour"
import updateFormQuestionBehaviour from "src/form-questions/mutations/updateFormQuestionBehaviour"
import { AuthorizationError } from "blitz"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import UpgradeMessage from "src/plans/components/UpgradeMessage"

export const getServerSideProps = gSSP(async (context) => {
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

      const job = await getJob(
        {
          where: {
            slug: (context?.params?.slug as string) || "0",
            companyId: session?.companyId || "0",
          },
        },
        context.ctx
      )

      const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

      return {
        props: {
          user,
          job,
          activePlanName,
          // canUpdate: canUpdate,
          // form: form,
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
        destination: `/auth/login?next=/forms/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

export const JobApplicationForm = ({
  job,
  user,
  setQuestionToEdit,
  setOpenAddNewQuestion,
  openUpgradeConfirm,
  setOpenUpgradeConfirm,
  activePlanName,
}) => {
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
            title: {
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
          isDragDisabled: !question?.allowEdit,
          renderContent: (
            <>
              <div className="flex flex-col space-y-2">
                <div className="w-full relative">
                  <div className="font-bold flex justify-between">
                    {question.allowEdit ? (
                      // <Link legacyBehavior prefetch={true} href={Routes.SingleQuestionPage({ slug: fq.question.slug })} passHref>
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

                          if (activePlanName === PlanName.FREE) {
                            setOpenUpgradeConfirm(true)
                          } else {
                            setFormQuestionToRemove(question)
                            setOpenConfirm(true)
                          }
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
      {/* <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div> */}
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

      <Confirm
        open={openUpgradeConfirm}
        setOpen={setOpenUpgradeConfirm}
        header="Upgrade to lifetime plan"
        cancelText="Ok"
        hideConfirm={true}
        onSuccess={async () => {
          setOpenConfirm(false)
          setOpenUpgradeConfirm(false)
          setFormQuestionToRemove(null)
        }}
      >
        Upgrade to lifetime plan for customising job application form.
      </Confirm>

      <div className="w-full flex flex-wrap md:flex-nowrap lg:flex-nowrap space-y-6 md:space-y-0 lg:space-y-0 md:space-x-8 lg:space-x-8">
        <div className="w-full md:w-1/2 xl:w-3/5 p-3 border-2 border-theme-400 rounded">
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
        <div className="w-full md:w-1/2 xl:w-2/5 flex justify-end">
          <div
            className={`w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl sticky top-0`}
          >
            {/* <div className="bg-neutral-400 rounded-b-2xl h-8 w-1/2 absolute left-1/4 top-0" /> */}
            {/* <div className="border-2 border-neutral-400 rounded-2xl h-2 w-1/3 absolute left-1/3 top-2" /> */}
            <div className="w-full h-full rounded-2xl">
              <ApplicationForm
                header="Job Application Form (Preview)"
                subHeader=""
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
  activePlanName,
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

  const [openUpgradeConfirm, setOpenUpgradeConfirm] = React.useState(false)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Application Form" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
              <div className="sm:mr-5">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Job Application Form
                </h2>
                <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                  Add and re-order application form questions
                </h4>
                <h4 className="text-xs sm:text-sm text-gray-700">
                  The questions added here shall appear on Careers Page
                </h4>
                <h4 className="text-xs sm:text-sm text-gray-700">
                  Turn off the question to show it internally but not on Careers Page
                </h4>
                {activePlanName === PlanName.FREE && (
                  <div className="mt-2">
                    <UpgradeMessage message="Upgrade to add more questions" />
                  </div>
                )}
              </div>
              <Modal
                header="Add New Question"
                open={openAddNewQuestion}
                setOpen={setOpenAddNewQuestion}
                noOverflow={true}
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
                    if (activePlanName === PlanName.FREE) {
                      setQuestionToEdit(null as any)
                      setOpenAddNewQuestion(false)
                      setOpenUpgradeConfirm(true)
                      return
                    }

                    const isEdit = questionToEdit ? true : false

                    const toastId = toast.loading(isEdit ? "Updating Question" : "Adding Question")
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
                        `Failed to ${isEdit ? "update" : "add new"} question - ${error.toString()}`,
                        { id: toastId }
                      )
                    }
                  }}
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

            <Suspense fallback={<p className="pt-3">Loading...</p>}>
              <JobApplicationForm
                job={job}
                user={user}
                setQuestionToEdit={setQuestionToEdit}
                setOpenAddNewQuestion={setOpenAddNewQuestion}
                openUpgradeConfirm={openUpgradeConfirm}
                setOpenUpgradeConfirm={setOpenUpgradeConfirm}
                activePlanName={activePlanName}
              />
            </Suspense>
          </div>
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsApplicationFormPage
