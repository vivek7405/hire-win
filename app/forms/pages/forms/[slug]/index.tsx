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
import AddQuestionForm from "app/forms/components/AddQuestionForm"
import toast from "react-hot-toast"
import createFormQuestion from "app/forms/mutations/createFormQuestion"
import { FormQuestion } from "app/forms/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon } from "@heroicons/react/outline"
import { ExtendedFormQuestion, ShiftDirection } from "types"
import shiftFormQuestion from "app/forms/mutations/shiftFormQuestion"
import Confirm from "app/core/components/Confirm"
import removeQuestionFromForm from "app/forms/mutations/removeQuestionFromForm"
import ApplicationForm from "app/jobs/components/ApplicationForm"

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

  const [{ formQuestions, hasMore, count }] = usePaginatedQuery(getFormQuestions, {
    where: {
      formId: form?.id,
      ...query,
    },
    orderBy: { order: "asc" },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  // Use blitz guard to check if user can update t

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

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
        return (
          <Link
            href={Routes.QuestionSettingsPage({ slug: props.cell.row.original.question.slug })}
            passHref
          >
            <a data-testid={`questionlink`} className="text-theme-600 hover:text-theme-900">
              {props.cell.row.original.question.name}
            </a>
          </Link>
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
        return (
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
                router.reload()
              }}
            >
              Are you sure you want to remove this question from the form?
            </Confirm>
            <button
              title="Remove Question"
              className="mr-16 align-middle bg-red-500 rounded-full"
              onClick={async (e) => {
                e.preventDefault()

                const formQuestion: ExtendedFormQuestion = props.cell.row.original
                setFormQuestionToRemove(formQuestion)
                setOpenConfirm(true)
              }}
            >
              <XCircleIcon className="w-auto h-4 text-red-100" />
            </button>

            {props.cell.row.original.order !== 1 && (
              <button
                title="Move Up"
                className="ml-2 align-middle"
                onClick={async (e) => {
                  const formQuestion: ExtendedFormQuestion = props.cell.row.original

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
                          Order changed from {formQuestion.order} to {formQuestion.order - 1} for
                          Question {formQuestion.question.name}
                        </span>
                      ),
                      { id: toastId }
                    )
                    router.reload()
                  } catch (error) {
                    toast.error(
                      "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                      { id: toastId }
                    )
                  }
                }}
              >
                <ArrowUpIcon className="h-4 cursor-pointer text-theme-500 hover:text-theme-900" />
              </button>
            )}

            {props.cell.row.original.order !== formQuestions.length && (
              <button
                title="Move Down"
                className="ml-2 align-middle"
                onClick={async (e) => {
                  const formQuestion: ExtendedFormQuestion = props.cell.row.original

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
                          Order changed from {formQuestion.order} to {formQuestion.order + 1} for
                          Question {formQuestion.question.name}
                        </span>
                      ),
                      { id: toastId }
                    )
                    router.reload()
                  } catch (error) {
                    toast.error(
                      "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                      { id: toastId }
                    )
                  }
                }}
              >
                <ArrowDownIcon className="h-4 cursor-pointer text-theme-500 hover:text-theme-900" />
              </button>
            )}
          </>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      data={data}
      pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
      pageIndex={tablePage}
      pageSize={ITEMS_PER_PAGE}
      hasNext={hasMore}
      hasPrevious={tablePage !== 0}
      totalCount={count}
      startPage={startPage}
      endPage={endPage}
    />
  )
}

const SingleFormPage = ({
  user,
  form,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddQuestion, setOpenAddQuestion] = React.useState(false)
  const [openPreviewForm, setOpenPreviewForm] = React.useState(false)
  const [createFormQuestionMutation] = useMutation(createFormQuestion)
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      {canUpdate && (
        <>
          <Link href={Routes.FormSettingsPage({ slug: form?.slug! })} passHref>
            <a data-testid={`${form?.name && `${form?.name}-`}settingsLink`}>Settings</a>
          </Link>
          <br />
          <br />
          <Modal header="Add Question" open={openAddQuestion} setOpen={setOpenAddQuestion}>
            <AddQuestionForm
              schema={FormQuestion}
              user={user}
              formId={form?.id!}
              onSubmit={async (values) => {
                const toastId = toast.loading(() => <span>Adding Question</span>)
                try {
                  await createFormQuestionMutation({
                    formId: form?.id as string,
                    questionId: values.questionId,
                  })
                  toast.success(() => <span>Question added</span>, {
                    id: toastId,
                  })
                  router.reload()
                } catch (error) {
                  toast.error(
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                    { id: toastId }
                  )
                }
              }}
            />
          </Modal>
          <button
            onClick={(e) => {
              e.preventDefault()
              setOpenAddQuestion(true)
            }}
            data-testid={`open-addQuestion-modal`}
            className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
          >
            Add Question
          </button>

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
            className="mr-3 float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
          >
            Preview Form
          </button>

          <Suspense
            fallback={
              <Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />
            }
          >
            <Questions form={form} user={user} />
          </Suspense>
        </>
      )}
    </AuthLayout>
  )
}

export default SingleFormPage
