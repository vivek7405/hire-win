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
// import AddStageWorkflow from "app/workflows/components/AddStageWorkflow"
import toast from "react-hot-toast"
import createWorkflowStage from "app/workflows/mutations/createWorkflowStage"
import { WorkflowStage, WorkflowStages } from "app/workflows/validations"

import { ArrowUpIcon, ArrowDownIcon, XCircleIcon } from "@heroicons/react/outline"
import { ExtendedWorkflowStage, ShiftDirection } from "types"
import shiftWorkflowStage from "app/workflows/mutations/shiftWorkflowStage"
import Confirm from "app/core/components/Confirm"
import removeStageFromWorkflow from "app/workflows/mutations/removeStageFromWorkflow"
import getWorkflowStagesWOPagination from "app/workflows/queries/getWorkflowStagesWOPagination"
import StageForm from "app/stages/components/StageForm"
import addExistingWorkflowStages from "app/workflows/mutations/addExistingWorkflowStages"
import AddExistingStagesForm from "app/workflows/components/AddExistingStagesForm"
import createQuestion from "app/questions/mutations/createQuestion"
import createStage from "app/stages/mutations/createStage"
import addNewStageToWorkflow from "app/workflows/mutations/addNewStageToWorkflow"

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

  const [workflowStages] = usePaginatedQuery(getWorkflowStagesWOPagination, {
    where: {
      workflowId: workflow?.id,
      ...query,
    },
    orderBy: { order: "asc" },
  })

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
      Header: "Name",
      accessor: "stage.name",
      Cell: (props) => {
        const workflowStage: ExtendedWorkflowStage = props.cell.row.original

        return (
          <>
            {workflowStage.stage.allowEdit ? (
              <Link href={Routes.SingleStagePage({ slug: workflowStage.stage.slug })} passHref>
                <a data-testid={`stagelink`} className="text-theme-600 hover:text-theme-900">
                  {workflowStage.stage.name}
                </a>
              </Link>
            ) : (
              <span>{workflowStage.stage.name}</span>
            )}
          </>
        )
      },
    },
    {
      Header: "",
      accessor: "action",
      Cell: (props) => {
        const workflowStage: ExtendedWorkflowStage = props.cell.row.original

        return (
          <>
            <div className="flex space-x-8">
              {workflowStage.stage.allowEdit && (
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
                          "Sorry, we had an unexpected error. Please try again. - " +
                            error.toString(),
                          { id: toastId }
                        )
                      }
                      router.reload()
                    }}
                  >
                    Are you sure you want to remove this stage from the workflow?
                  </Confirm>
                  {workflowStage.stage.allowEdit && (
                    <button
                      title="Remove Stage"
                      className="align-middle rounded-full"
                      onClick={async (e) => {
                        e.preventDefault()

                        setWorkflowStageToRemove(workflowStage)
                        setOpenConfirm(true)
                      }}
                    >
                      <XCircleIcon className="w-6 h-auto text-red-500 hover:text-red-600" />
                    </button>
                  )}

                  <div className="flex">
                    <button
                      disabled={workflowStage.order === workflowStages.length - 1}
                      title="Move Down"
                      className="align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
                      onClick={async (e) => {
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
                                Order changed from {workflowStage.order} to{" "}
                                {workflowStage.order + 1} for Stage {workflowStage.stage.name}
                              </span>
                            ),
                            { id: toastId }
                          )
                          const x = workflowStage.order
                          const y = workflowStage.order - 1
                          if (x <= workflowStages.length - 1 && y <= workflowStages.length - 1) {
                            const row = workflowStages[x]!
                            workflowStages[x] = {
                              ...workflowStages[y]!,
                              order: workflowStage.order + 1,
                            }
                            workflowStages[y] = { ...row, order: workflowStage.order }
                            setData(workflowStages)
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
                      {!(workflowStage.order === workflowStages.length - 1) && (
                        <ArrowDownIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
                      )}

                      {workflowStage.order === workflowStages.length - 1 && (
                        <ArrowDownIcon className="h-5 cursor-not-allowed text-gray-300" />
                      )}
                    </button>

                    <button
                      disabled={workflowStage.order === 2}
                      title="Move Up"
                      className="ml-2 align-middle disabled:cursor-not-allowed transition duration-150 ease-in-out hover:scale-150 disabled:hover:scale-100"
                      onClick={async (e) => {
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
                                Order changed from {workflowStage.order} to{" "}
                                {workflowStage.order - 1} for Stage {workflowStage.stage.name}
                              </span>
                            ),
                            { id: toastId }
                          )
                          const x = workflowStage.order - 1
                          const y = workflowStage.order - 2
                          if (x <= workflowStages.length - 1 && y <= workflowStages.length - 1) {
                            const row = workflowStages[x]!
                            workflowStages[x] = {
                              ...workflowStages[y]!,
                              order: workflowStage.order,
                            }
                            workflowStages[y] = { ...row, order: workflowStage.order - 1 }
                            setData(workflowStages)
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
                      {!(workflowStage.order === 2) && (
                        <ArrowUpIcon className="h-5 cursor-pointer text-theme-500 hover:text-theme-600" />
                      )}

                      {workflowStage.order === 2 && (
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
      pageCount={Math.ceil(workflowStages.length / ITEMS_PER_PAGE)}
      pageIndex={tablePage}
      pageSize={ITEMS_PER_PAGE}
      hasNext={false}
      hasPrevious={false}
      totalCount={workflowStages.length}
      startPage={1}
      endPage={1}
      noPagination={true}
    />
  )
}

const SingleWorkflowPage = ({
  user,
  workflow,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // const [open, setOpen] = React.useState(false)
  const [createStageMutation] = useMutation(createStage)
  const [addNewStageToWorkflowMutation] = useMutation(addNewStageToWorkflow)
  const [createWorkflowStageMutation] = useMutation(createWorkflowStage)
  const [addExistingWorkflowStagesMutation] = useMutation(addExistingWorkflowStages)
  const [openAddExistingStage, setOpenAddExistingStage] = React.useState(false)
  const [openAddNewStage, setOpenAddNewStage] = React.useState(false)
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      {/* {canUpdate && (
        <>
          <Link href={Routes.WorkflowSettingsPage({ slug: workflow?.slug! })} passHref>
            <a data-testid={`${workflow?.name && `${workflow?.name}-`}settingsLink`}>Settings</a>
          </Link>
          <br />
          <br />
          <Modal header="Add Stage" open={open} setOpen={setOpen}>
            <AddStageWorkflow
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
      )} */}

      {canUpdate && (
        <div className="space-y-6">
          <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
            <div className="space-x-8 flex flex-row justify-between">
              <Link href={Routes.StagesHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Stage Pool
                </a>
              </Link>

              <Link href={Routes.WorkflowSettingsPage({ slug: workflow?.slug! })} passHref>
                <a
                  className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800"
                  data-testid={`${workflow?.name && `${workflow?.name}-`}settingsLink`}
                >
                  Workflow Settings
                </a>
              </Link>
            </div>

            <div className="flex flex-row justify-between space-x-3">
              <Modal
                header="Add Stages from Pool"
                open={openAddExistingStage}
                setOpen={setOpenAddExistingStage}
              >
                <AddExistingStagesForm
                  schema={WorkflowStages}
                  user={user}
                  workflowId={workflow?.id!}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding Stage(s)</span>)
                    try {
                      await addExistingWorkflowStagesMutation({
                        workflowId: workflow?.id as string,
                        stageIds: values.stageIds,
                      })
                      toast.success(() => <span>Stage(s) added</span>, {
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
                  setOpenAddExistingStage(true)
                }}
                data-testid={`open-addStage-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add Stages from Pool
              </button>

              <Modal header="Add New Stage" open={openAddNewStage} setOpen={setOpenAddNewStage}>
                <StageForm
                  header="Add New Stage to Workflow"
                  subHeader="Enter stage details"
                  initialValues={{
                    name: "",
                  }}
                  onSubmit={async (values) => {
                    const toastId = toast.loading(() => <span>Adding Stage</span>)
                    try {
                      await addNewStageToWorkflowMutation({
                        ...values,
                        workflowId: workflow?.id as string,
                      })
                      toast.success(() => <span>Stage added</span>, {
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
                  setOpenAddNewStage(true)
                }}
                data-testid={`open-addStage-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add New Stage
              </button>
            </div>
          </div>

          <Suspense
            fallback={
              <Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />
            }
          >
            <Stages workflow={workflow} user={user} />
          </Suspense>
        </div>
      )}
    </AuthLayout>
  )
}

export default SingleWorkflowPage
