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

import getWorkflow from "app/workflows/queries/getWorkflow"
import Skeleton from "react-loading-skeleton"
import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import getWorkflowStages from "app/workflows/queries/getWorkflowStages"
import AddStageForm from "app/workflows/components/AddStageForm"
import toast from "react-hot-toast"
import createWorkflowStage from "app/workflows/mutations/createWorkflowStage"
import { WorkflowStage } from "app/workflows/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon } from "@heroicons/react/outline"
import { ExtendedWorkflowStage, ShiftDirection } from "types"
import shiftWorkflowStage from "app/workflows/mutations/shiftWorkflowStage"
import Confirm from "app/core/components/Confirm"
import removeStageFromWorkflow from "app/workflows/mutations/removeStageFromWorkflow"

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
    "workflow",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      const workflow = await invokeWithMiddleware(
        getWorkflow,
        { where: { slug: context?.params?.slug!, userId: user?.id } },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          workflow: workflow,
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
        destination: `/login?next=/workflows/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

export const Stages = ({ user, workflow }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<{}[]>([])
  const [query, setQuery] = useState({})
  const [shiftWorkflowStageMutation] = useMutation(shiftWorkflowStage)
  const [removeStageFromWorkflowMutation] = useMutation(removeStageFromWorkflow)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [workflowStageToRemove, setWorkflowStageToRemove] = React.useState(
    {} as ExtendedWorkflowStage
  )

  useEffect(() => {
    const search = router.query.search
      ? {
          AND: {
            stage: {
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

  const [{ workflowStages, hasMore, count }] = usePaginatedQuery(getWorkflowStages, {
    where: {
      workflowId: workflow?.id,
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
    let data: ExtendedWorkflowStage[] = []

    await workflowStages.forEach((workflowStage) => {
      data = [...data, { ...workflowStage }]

      setData(data)
    })
  }, [workflowStages])

  let columns = [
    {
      Header: "Order",
      accessor: "order",
    },
    {
      Header: "Id",
      accessor: "stage.id",
    },
    {
      Header: "Name",
      accessor: "stage.name",
      Cell: (props) => {
        return (
          <Link
            href={Routes.StageSettingsPage({ slug: props.cell.row.original.stage.slug })}
            passHref
          >
            <a data-testid={`stagelink`} className="text-theme-600 hover:text-theme-900">
              {props.cell.row.original.stage.name}
            </a>
          </Link>
        )
      },
    },
    {
      Header: "Slug",
      accessor: "stage.slug",
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
                Object.entries(workflowStageToRemove).length
                  ? `Remove Stage - ${workflowStageToRemove.stage.name}?`
                  : "Remove Stage?"
              }
              onSuccess={async () => {
                const toastId = toast.loading(() => (
                  <span>Removing Stage {workflowStageToRemove.stage.name}</span>
                ))
                try {
                  await removeStageFromWorkflowMutation({
                    workflowId: workflowStageToRemove.workflowId,
                    order: workflowStageToRemove.order,
                  })
                  toast.success(
                    () => <span>Stage removed - {workflowStageToRemove.stage.name}</span>,
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
              Are you sure you want to remove this stage from the workflow?
            </Confirm>
            <button
              title="Remove Stage"
              className="mr-16 align-middle bg-red-500 rounded-full"
              onClick={async (e) => {
                e.preventDefault()

                const workflowStage: ExtendedWorkflowStage = props.cell.row.original
                setWorkflowStageToRemove(workflowStage)
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
                  const workflowStage: ExtendedWorkflowStage = props.cell.row.original

                  const toastId = toast.loading(() => (
                    <span>Changing stage order for {workflowStage.stage.name}</span>
                  ))
                  try {
                    await shiftWorkflowStageMutation({
                      workflowId: workflowStage.workflowId,
                      order: workflowStage.order,
                      shiftDirection: ShiftDirection.UP,
                    })
                    toast.success(
                      () => (
                        <span>
                          Order changed from {workflowStage.order} to {workflowStage.order - 1} for
                          Stage {workflowStage.stage.name}
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

            {props.cell.row.original.order !== workflowStages.length && (
              <button
                title="Move Down"
                className="ml-2 align-middle"
                onClick={async (e) => {
                  const workflowStage: ExtendedWorkflowStage = props.cell.row.original

                  const toastId = toast.loading(() => (
                    <span>Changing stage order for {workflowStage.stage.name}</span>
                  ))
                  try {
                    await shiftWorkflowStageMutation({
                      workflowId: workflowStage.workflowId,
                      order: workflowStage.order,
                      shiftDirection: ShiftDirection.DOWN,
                    })
                    toast.success(
                      () => (
                        <span>
                          Order changed from {workflowStage.order} to {workflowStage.order + 1} for
                          Stage {workflowStage.stage.name}
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

const SingleWorkflowPage = ({
  user,
  workflow,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [open, setOpen] = React.useState(false)
  const [createWorkflowStageMutation] = useMutation(createWorkflowStage)
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
          <Link href={Routes.WorkflowSettingsPage({ slug: workflow?.slug! })} passHref>
            <a data-testid={`${workflow?.name && `${workflow?.name}-`}settingsLink`}>Settings</a>
          </Link>
          <br />
          <br />
          <Modal header="Add Stage" open={open} setOpen={setOpen}>
            <AddStageForm
              schema={WorkflowStage}
              user={user}
              workflowId={workflow?.id!}
              onSubmit={async (values) => {
                const toastId = toast.loading(() => <span>Adding Stage - {values.stage}</span>)
                try {
                  await createWorkflowStageMutation({
                    workflowId: workflow?.id as string,
                    stageId: values.stageId,
                  })
                  toast.success(() => <span>Stage added - {values.stage}</span>, { id: toastId })
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
              setOpen(true)
            }}
            data-testid={`open-addStage-modal`}
            className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
          >
            Add Stage
          </button>
          <Suspense
            fallback={
              <Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />
            }
          >
            <Stages workflow={workflow} user={user} />
          </Suspense>
        </>
      )}
    </AuthLayout>
  )
}

export default SingleWorkflowPage
