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

import getForm from "app/forms/queries/getForm"
import Skeleton from "react-loading-skeleton"
import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import getFormQuestions from "app/forms/queries/getFormQuestions"
import AddExistingQuestionsForm from "app/forms/components/AddExistingQuestionsForm"
import toast from "react-hot-toast"
import createFormQuestion from "app/forms/mutations/createFormQuestion"
import { FormQuestion, FormQuestions } from "app/forms/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon } from "@heroicons/react/outline"
import { ExtendedFormQuestion, ShiftDirection } from "types"
import shiftFormQuestion from "app/forms/mutations/shiftFormQuestion"
import Confirm from "app/core/components/Confirm"
import removeQuestionFromForm from "app/forms/mutations/removeQuestionFromForm"
import ApplicationForm from "app/jobs/components/ApplicationForm"
import { FormQuestionBehaviour, QuestionType } from "@prisma/client"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import Form from "app/core/components/Form"
import updateFormQuestion from "app/forms/mutations/updateFormQuestion"
import factoryFormQuestions from "app/questions/utils/factoryFormQuestions"
import getFormQuestionsWOPagination from "app/forms/queries/getFormQuestionsWOPagination"
import QuestionForm from "app/questions/components/QuestionForm"
import createQuestion from "app/questions/mutations/createQuestion"
import addExistingFormQuestions from "app/forms/mutations/addExistingFormQuestions"
import addNewQuestionToForm from "app/forms/mutations/addNewQuestionToForm"

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
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      const form = await invokeWithMiddleware(
        getForm,
        { where: { slug: context?.params?.slug!, userId: user?.id } },
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

export const Questions = ({ user, form }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})
  const [shiftFormQuestionMutation] = useMutation(shiftFormQuestion)
  const [updateFormQuestionMutation] = useMutation(updateFormQuestion)
  const [removeQuestionFromFormMutation] = useMutation(removeQuestionFromForm)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [formQuestionToRemove, setFormQuestionToRemove] = React.useState({} as ExtendedFormQuestion)

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

    await formQuestions.forEach((formQuestion) => {
      data = [...data, { ...formQuestion }]
      setData(data)
    })
  }, [formQuestions])

  let columns = [
    {
      Header: "Order",
      accessor: "order",
    },
    {
      Header: "Name",
      accessor: "question.name",
      Cell: (props) => {
        const formQuestion: ExtendedFormQuestion = props.cell.row.original

        return (
          <>
            {!formQuestion.question.factory ? (
              <Link href={Routes.SingleQuestionPage({ slug: formQuestion.question.slug })} passHref>
                <a data-testid={`questionlink`} className="text-theme-600 hover:text-theme-900">
                  {formQuestion.question.name}
                </a>
              </Link>
            ) : (
              formQuestion.question.name
            )}
          </>
        )
      },
    },
    {
      Header: "Type",
      accessor: "question.type",
      Cell: (props) => {
        return props.value.toString().replaceAll("_", " ")
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: (props) => {
        const formQuestion: ExtendedFormQuestion = props.cell.row.original

        return (
          <>
            <div className="flex space-x-8">
              {formQuestion.allowBehaviourEdit && (
                <Form noFormatting={true} onSubmit={async (values) => {}}>
                  <LabeledToggleGroupField
                    name={`formQuestion-${formQuestion.id}-behaviour`}
                    paddingX={3}
                    paddingY={1}
                    defaultValue={formQuestion?.behaviour || FormQuestionBehaviour.OPTIONAL}
                    value={formQuestion?.behaviour}
                    options={Object.keys(FormQuestionBehaviour).map((formQuestionBehaviour) => {
                      return { label: formQuestionBehaviour, value: formQuestionBehaviour }
                    })}
                    onChange={async (value) => {
                      const toastId = toast.loading(() => (
                        <span>
                          <b>Setting behaviour as {value}</b>
                          <br />
                          for question - {formQuestion.question.name}
                        </span>
                      ))
                      try {
                        await updateFormQuestionMutation({
                          where: { id: formQuestion?.id },
                          data: {
                            order: formQuestion.order,
                            behaviour: value,
                          },
                        })
                        toast.success(
                          () => (
                            <span>
                              <b>Behaviour changed successfully</b>
                              <br />
                              for question - {formQuestion?.question?.name}
                            </span>
                          ),
                          { id: toastId }
                        )
                        formQuestion.behaviour = value
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
              )}

              {!formQuestion.question.factory && (
                <>
                  <Confirm
                    open={openConfirm}
                    setOpen={setOpenConfirm}
                    header={
                      Object.entries(formQuestionToRemove).length
                        ? `Remove Question - ${formQuestionToRemove.question.name}?`
                        : "Remove Question?"
                    }
                    onSuccess={async () => {
                      const toastId = toast.loading(() => (
                        <span>Removing Question {formQuestionToRemove.question.name}</span>
                      ))
                      try {
                        await removeQuestionFromFormMutation({
                          formId: formQuestionToRemove.formId,
                          order: formQuestionToRemove.order,
                        })
                        toast.success(
                          () => (
                            <span>Question removed - {formQuestionToRemove.question.name}</span>
                          ),
                          {
                            id: toastId,
                          }
                        )
                      } catch (error) {
                        toast.error(
                          "Sorry, we had an unexpected error. Please try again. - " +
                            error.toString(),
                          { id: toastId }
                        )
                      }
                      router.reload()
                    }}
                  >
                    Are you sure you want to remove this question from the form?
                  </Confirm>
                  {!formQuestion.question.factory && (
                    <button
                      title="Remove Question"
                      className="align-middle rounded-full"
                      onClick={async (e) => {
                        e.preventDefault()

                        setFormQuestionToRemove(formQuestion)
                        setOpenConfirm(true)
                      }}
                    >
                      <XCircleIcon className="w-6 h-auto text-red-500 hover:text-red-600" />
                    </button>
                  )}

                  <div className="flex">
                    <button
                      disabled={formQuestion.order === formQuestions.length}
                      title="Move Down"
                      className="align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
                      onClick={async (e) => {
                        const toastId = toast.loading(() => (
                          <span>Changing question order for {formQuestion.question.name}</span>
                        ))
                        try {
                          await shiftFormQuestionMutation({
                            formId: formQuestion.formId,
                            order: formQuestion.order,
                            shiftDirection: ShiftDirection.DOWN,
                          })
                          toast.success(
                            () => (
                              <span>
                                Order changed from {formQuestion.order} to {formQuestion.order + 1}{" "}
                                for Question {formQuestion.question.name}
                              </span>
                            ),
                            { id: toastId }
                          )
                          const x = formQuestion.order
                          const y = formQuestion.order - 1
                          if (x <= formQuestions.length - 1 && y <= formQuestions.length - 1) {
                            const row = formQuestions[x]!
                            formQuestions[x] = {
                              ...formQuestions[y]!,
                              order: formQuestion.order + 1,
                            }
                            formQuestions[y] = { ...row, order: formQuestion.order }
                            setData(formQuestions)
                          } else {
                            toast.error("Index out of range")
                          }
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString(),
                            { id: toastId }
                          )
                        }
                      }}
                    >
                      {!(formQuestion.order === formQuestions.length) && (
                        <ArrowDownIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
                      )}

                      {formQuestion.order === formQuestions.length && (
                        <ArrowDownIcon className="h-5 cursor-not-allowed text-gray-300" />
                      )}
                    </button>

                    <button
                      disabled={
                        formQuestion.order === 1 ||
                        formQuestion.order === factoryFormQuestions.length + 1
                      }
                      title="Move Up"
                      className="ml-2 align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
                      onClick={async (e) => {
                        const toastId = toast.loading(() => (
                          <span>Changing question order for {formQuestion.question.name}</span>
                        ))
                        try {
                          await shiftFormQuestionMutation({
                            formId: formQuestion.formId,
                            order: formQuestion.order,
                            shiftDirection: ShiftDirection.UP,
                          })
                          toast.success(
                            () => (
                              <span>
                                Order changed from {formQuestion.order} to {formQuestion.order - 1}{" "}
                                for Question {formQuestion.question.name}
                              </span>
                            ),
                            { id: toastId }
                          )
                          const x = formQuestion.order - 1
                          const y = formQuestion.order - 2
                          if (x <= formQuestions.length - 1 && y <= formQuestions.length - 1) {
                            const row = formQuestions[x]!
                            formQuestions[x] = { ...formQuestions[y]!, order: formQuestion.order }
                            formQuestions[y] = { ...row, order: formQuestion.order - 1 }
                            setData(formQuestions)
                          } else {
                            toast.error("Index out of range")
                          }
                        } catch (error) {
                          toast.error(
                            "Sorry, we had an unexpected error. Please try again. - " +
                              error.toString(),
                            { id: toastId }
                          )
                        }
                      }}
                    >
                      {!(
                        formQuestion.order === 1 ||
                        formQuestion.order === factoryFormQuestions.length + 1
                      ) && (
                        <ArrowUpIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
                      )}

                      {(formQuestion.order === 1 ||
                        formQuestion.order === factoryFormQuestions.length + 1) && (
                        <ArrowUpIcon className="h-5 cursor-not-allowed text-gray-300" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      data={data}
      pageCount={formQuestions.length}
      pageIndex={tablePage}
      pageSize={ITEMS_PER_PAGE}
      hasNext={false}
      hasPrevious={false}
      totalCount={formQuestions.length}
      startPage={1}
      endPage={1}
      noPagination={true}
      noMarginRight={true}
    />
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
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      {canUpdate && (
        <div className="space-y-6">
          <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
            <div className="space-x-8 flex flex-row justify-between">
              <Modal header="Preview Form" open={openPreviewForm} setOpen={setOpenPreviewForm}>
                <ApplicationForm
                  header="Job Application Form"
                  subHeader="Preview"
                  formId={form?.id!}
                  preview={true}
                  onSubmit={async (values) => {
                    toast.error("Can't submit the form in preview mode")
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpenPreviewForm(true)
                }}
                data-testid={`open-previewForm-modal`}
                className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
              >
                Preview Form
              </button>

              <Link href={Routes.QuestionsHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Question Pool
                </a>
              </Link>

              <Link href={Routes.FormSettingsPage({ slug: form?.slug! })} passHref>
                <a
                  className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
                  data-testid={`${form?.name && `${form?.name}-`}settingsLink`}
                >
                  Form Settings
                </a>
              </Link>
            </div>

            <div className="flex flex-row justify-between space-x-3">
              <Modal
                header="Add Existing Questions"
                open={openAddExistingQuestions}
                setOpen={setOpenAddExistingQuestions}
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
                      toast.success(() => <span>Question(s) added</span>, {
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
                  setOpenAddExistingQuestions(true)
                }}
                data-testid={`open-addQuestion-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add Existing Questions
              </button>

              <Modal
                header="Add New Question"
                open={openAddNewQuestion}
                setOpen={setOpenAddNewQuestion}
              >
                <QuestionForm
                  header="Add New Question to Form"
                  subHeader="Enter question details"
                  initialValues={{
                    name: "",
                  }}
                  editmode={false}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding Question</span>)
                    try {
                      await addNewQuestionToFormMutation({
                        ...values,
                        formId: form?.id as string,
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
                  setOpenAddNewQuestion(true)
                }}
                data-testid={`open-addQuestion-modal`}
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
            <Questions form={form} user={user} />
          </Suspense>
        </div>
      )}
    </AuthLayout>
  )
}

export default SingleFormPage
