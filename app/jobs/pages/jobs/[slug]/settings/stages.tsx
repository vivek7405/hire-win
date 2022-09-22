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
  useSession,
  invalidateQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

// import getWorkflow from "app/workflows/queries/getWorkflow"

import Modal from "app/core/components/Modal"
import Table from "app/core/components/Table"
import toast from "react-hot-toast"

import { XIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedStage, ShiftDirection } from "types"
import shiftJobStage from "app/stages/mutations/shiftJobStage"
import Confirm from "app/core/components/Confirm"
import removeStageFromJob from "app/stages/mutations/removeStageFromJob"
import getJobStages from "app/stages/queries/getJobStages"
import StageForm from "app/stages/components/StageForm"
import addNewStageToJob from "app/stages/mutations/addNewStageToJob"
import Debouncer from "app/core/utils/debouncer"
import Cards from "app/core/components/Cards"
import { Stage } from "@prisma/client"
import updateStage from "app/stages/mutations/updateStage"
import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  //   const { can: canUpdate } = await Guard.can(
  //     "update",
  //     "workflow",
  //     { session },
  //     {
  //       where: {
  //         slug: context?.params?.slug!,
  //         companyId: session?.companyId || "0",
  //       },
  //     }
  //   )

  if (user) {
    try {
      //   const workflow = await invokeWithMiddleware(
      //     getWorkflow,
      //     {
      //       where: {
      //         slug: context?.params?.slug!,
      //         companyId: session?.companyId || "0",
      //       },
      //     },
      //     { ...context }
      //   )

      const job = await invokeWithMiddleware(
        getJob,
        {
          where: { slug: context?.params?.slug || "0", companyId: session?.companyId || "0" },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          job: job,
          //   canUpdate: canUpdate,
          //   workflow: workflow,
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

export const Stages = ({ user, setStageToEdit, setOpenAddNewStage, jobId }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [data, setData] = useState<ExtendedStage[]>([])
  const [query, setQuery] = useState({})
  const [shiftJobStageMutation] = useMutation(shiftJobStage)
  const [removeStageFromJobMutation] = useMutation(removeStageFromJob)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [workflowStageToRemove, setWorkflowStageToRemove] = React.useState(
    null as ExtendedStage | null
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

  const [stages] = useQuery(getJobStages, {
    where: {
      jobId,
      ...query,
    },
    orderBy: { order: "asc" },
  })

  useMemo(async () => {
    let data: ExtendedStage[] = []

    await stages?.forEach((stage) => {
      data = [...data, { ...stage }]
      setData(data)
    })
  }, [stages])

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

  const getCards = (stages) => {
    return stages?.map((stage) => {
      return {
        id: stage?.id,
        title: stage?.name,
        description: "",
        isDragDisabled: !stage.allowEdit,
        renderContent: (
          <>
            <div className="flex flex-col space-y-2">
              <div className="w-full relative">
                <div className="font-bold flex justify-between">
                  {stage.allowEdit ? (
                    <a
                      className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 truncate"
                      onClick={(e) => {
                        e.preventDefault()
                        setStageToEdit(stage)
                        setOpenAddNewStage(true)
                      }}
                    >
                      {stage.name}
                    </a>
                  ) : (
                    // <Link prefetch={true} href={Routes.SingleStagePage({ slug: ws.stage.slug })} passHref>
                    //   <a data-testid={`stagelink`} className="text-theme-600 hover:text-theme-900">
                    //     {ws.stage.name}
                    //   </a>
                    // </Link>
                    stage.name
                  )}
                </div>
                {stage.allowEdit && (
                  <div className="absolute top-0.5 right-0">
                    {/* <Link prefetch={true} href={Routes.FormSettingsPage({ slug: fq.slug })} passHref>
                      <a className="float-right text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </a>
                    </Link> */}
                    <button
                      className="float-right text-red-600 hover:text-red-800"
                      title="Remove Question"
                      onClick={async (e) => {
                        e.preventDefault()

                        setWorkflowStageToRemove(stage)
                        setOpenConfirm(true)
                      }}
                    >
                      <XIcon className="h-5 w-5" />
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
          workflowStageToRemove ? `Remove Stage - ${workflowStageToRemove.name}?` : "Remove Stage?"
        }
        onSuccess={async () => {
          const toastId = toast.loading(() => (
            <span>Removing Stage {workflowStageToRemove?.name}</span>
          ))
          try {
            if (!workflowStageToRemove) {
              throw new Error("No stage set to remove")
            }
            await removeStageFromJobMutation({
              jobId: workflowStageToRemove.jobId,
              order: workflowStageToRemove.order,
            })
            invalidateQuery(getJobStages)
            toast.success(() => <span>Stage removed - {workflowStageToRemove.name}</span>, {
              id: toastId,
            })
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              { id: toastId }
            )
          }
          setOpenConfirm(false)
          setWorkflowStageToRemove(null)
        }}
      >
        Are you sure you want to remove this stage from the workflow?
      </Confirm>
      <div className="sticky top-0 z-10 hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
        {data?.map((stage) => {
          return (
            <div
              key={stage.id}
              className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-white w-32 flex flex-col items-center justify-center"
            >
              <div className="overflow-hidden text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                {stage?.name}
              </div>
              {/* <div className="text-neutral-600">
                {job?.candidates?.filter((c) => c.workflowStageId === ws.id)?.length}
              </div> */}
            </div>
          )
        })}
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="w-full md:w-1/2 lg:w-1/2 p-3 border-2 border-neutral-300 rounded">
          <Cards
            noSearch={true}
            cards={cards}
            setCards={() => {}}
            noPagination={true}
            mutateCardDropDB={async (source, destination, draggableId) => {
              if (!(source && destination)) return

              // Don't allow drag for 1st and last index since Sourced & Hired can't be changed
              if (
                source.index === 0 ||
                source.index === data.length - 1 ||
                destination.index === 0 ||
                destination.index === data.length - 1
              ) {
                toast.error("The first and last stages cannot be changed")
                return
              }

              const stage = data?.find((stage) => stage.id === draggableId)
              if (stage) {
                data?.splice(source?.index, 1)
                data?.splice(destination?.index, 0, stage)
              }

              setData([...data])

              const toastId = toast.loading(() => (
                <span>Changing stage order for {stage?.name}</span>
              ))
              try {
                await shiftJobStageMutation({
                  jobId: stage?.jobId!,
                  sourceOrder: source?.index + 1,
                  destOrder: destination?.index + 1,
                })
                toast.success(
                  () => (
                    <span>
                      Order changed from {source?.index + 1} to {destination?.index + 1} for Stage{" "}
                      {stage?.name}
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
            droppableName="stages"
            isDragDisabled={false}
            direction={DragDirection.VERTICAL}
            isFull={true}
          />
        </div>
      </div>
      {/* <Table
        noSearch={true}
        noMarginRight={true}
        columns={columns}
        data={data}
        pageCount={Math.ceil(workflowStages?.length / ITEMS_PER_PAGE)}
        pageIndex={tablePage}
        pageSize={ITEMS_PER_PAGE}
        hasNext={false}
        hasPrevious={false}
        totalCount={workflowStages?.length}
        startPage={1}
        endPage={1}
        noPagination={true}
      /> */}
    </>
  )
}

const JobSettingsStagesPage = ({
  user,
  job,
  error,
}: //   canUpdate,
InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [addNewStageToJobMutation] = useMutation(addNewStageToJob)
  const [openAddExistingStage, setOpenAddExistingStage] = React.useState(false)
  const [openAddNewStage, setOpenAddNewStage] = React.useState(false)
  const [stageToEdit, setStageToEdit] = useState(null as any as Stage)
  const [updateStageMutation] = useMutation(updateStage)
  const router = useRouter()
  const session = useSession()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hiring Stages | hire.win" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={job!}>
        <br className="block md:hidden lg:hidden" />

        {/* {canUpdate && ( */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-6 md:space-y-0 lg:space-y-0 md:flex-row lg:flex-row md:float-right lg:float-right md:space-x-5 lg:space-x-5">
            {/* <div className="space-x-8 flex flex-row justify-center">
              <Link prefetch={true} href={Routes.StagesHome()} passHref>
                <a className="whitespace-nowrap underline text-theme-600 py-2 hover:text-theme-800">
                  Stage Pool
                </a>
              </Link>
            </div> */}

            <div className="flex flex-row justify-between space-x-3">
              {/* <Modal
              header="Add Stages from Pool"
              open={openAddExistingStage}
              setOpen={setOpenAddExistingStage}
              noOverflow={true}
            >
              <AddExistingStagesForm
                schema={WorkflowStages}
                companyId={session.companyId || "0"}
                // workflowId={workflow?.id!}
                onSubmit={async (values) => {
                  const toastId = toast.loading(() => <span>Adding Stage(s)</span>)
                  try {
                    await addExistingWorkflowStagesMutation({
                      workflowId: workflow?.id as string,
                      stageIds: values.stageIds,
                    })
                    invalidateQuery(getJobStages)
                    toast.success(() => <span>Stage(s) added</span>, {
                      id: toastId,
                    })
                  } catch (error) {
                    toast.error(
                      "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                      { id: toastId }
                    )
                  }
                  setOpenAddExistingStage(false)
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
            </button> */}

              <Modal header="Add New Stage" open={openAddNewStage} setOpen={setOpenAddNewStage}>
                <StageForm
                  header={`${stageToEdit ? "Update" : "Add New"} Stage`}
                  subHeader="Enter stage details"
                  initialValues={stageToEdit ? { name: stageToEdit?.name } : {}}
                  onSubmit={async (values) => {
                    const isEdit = stageToEdit ? true : false

                    const toastId = toast.loading(isEdit ? "Updating Stage" : "Creating Stage")
                    try {
                      isEdit
                        ? await updateStageMutation({
                            where: { id: stageToEdit.id },
                            data: { ...values },
                            initial: stageToEdit,
                          })
                        : await addNewStageToJobMutation({
                            jobId: job?.id || "0",
                            ...values,
                          })
                      await invalidateQuery(getJobStages)
                      toast.success(
                        isEdit ? "Stage updated successfully" : "Stage added successfully",
                        {
                          id: toastId,
                        }
                      )
                      setStageToEdit(null as any)
                      setOpenAddNewStage(false)
                    } catch (error) {
                      toast.error(
                        `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                        { id: toastId }
                      )
                    }
                  }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setStageToEdit(null as any)
                  setOpenAddNewStage(true)
                }}
                data-testid={`open-addStage-modal`}
                className="md:float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
              >
                Add New Stage
              </button>
            </div>
          </div>

          <Suspense fallback={<p className="pt-3">Loading...</p>}>
            <Stages
              jobId={job?.id || "0"}
              user={user}
              setStageToEdit={setStageToEdit}
              setOpenAddNewStage={setOpenAddNewStage}
            />
          </Suspense>
        </div>
        {/* )} */}
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsStagesPage
