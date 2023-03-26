import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useRouter } from "next/router"
import { getSession, useSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"

import { usePaginatedQuery, useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"

import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React, { Suspense, useEffect, useMemo, useState } from "react"
import path from "path"
import Guard from "src/guard/ability"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"

// import getWorkflow from "src/workflows/queries/getWorkflow"

import Modal from "src/core/components/Modal"
import Table from "src/core/components/Table"
import toast from "react-hot-toast"

import { CreditCardIcon, StarIcon, TrashIcon, XIcon } from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedStage, PlanName, ShiftDirection } from "types"
import shiftJobStage from "src/stages/mutations/shiftJobStage"
import Confirm from "src/core/components/Confirm"
import removeStageFromJob from "src/stages/mutations/removeStageFromJob"
import getJobStages from "src/stages/queries/getJobStages"
import StageForm from "src/stages/components/StageForm"
import addNewStageToJob from "src/stages/mutations/addNewStageToJob"
import Debouncer from "src/core/utils/debouncer"
import Cards from "src/core/components/Cards"
import { JobUserRole, Stage } from "@prisma/client"
import updateStage from "src/stages/mutations/updateStage"
import getJob from "src/jobs/queries/getJob"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import { PencilIcon } from "@heroicons/react/solid"
import { AuthorizationError } from "blitz"
import UpgradeMessage from "src/plans/components/UpgradeMessage"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import getJobUser from "src/jobs/queries/getJobUser"

export const getServerSideProps = gSSP(async (context) => {
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

      const job = await getJob(
        {
          where: {
            slug: (context?.params?.slug as string) || "0",
            companyId: session?.companyId || "0",
          },
        },
        { ...context.ctx }
      )

      const jobUser = await getJobUser(
        {
          where: {
            jobId: job?.id || "0",
            userId: user?.id || "0",
          },
        },
        context.ctx
      )
      let canAccess = true
      if (jobUser?.role === JobUserRole.USER) {
        canAccess = false
      }

      if (canAccess) {
        const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)
        return {
          props: {
            user: user,
            job: job,
            activePlanName,
            //   canUpdate: canUpdate,
            //   workflow: workflow,
          } as any,
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        }
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
        destination: `/auth/login?next=/workflows/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

export const Stages = ({
  user,
  setStageToEdit,
  setOpenAddNewStage,
  job,
  activePlanName,
  openUpgradeConfirm,
  setOpenUpgradeConfirm,
}) => {
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
      jobId: job?.id || "0",
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

  const getCards = (stages, jobSlug) => {
    return stages?.map((stage) => {
      return {
        id: stage?.id,
        title: stage?.name,
        description: "",
        isDragDisabled: !stage.allowEdit,
        renderContent: (
          <>
            <div className="space-y-2">
              <div className="w-full relative">
                <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                  <div className="pr-20 md:px-20 lg:px-20 text-neutral-700 truncate">
                    {stage.name}
                  </div>
                  {/* <Link
                    legacyBehavior
                    prefetch={true}
                    href={Routes.JobSettingsSingleScoreCardPage({
                      slug: jobSlug,
                      stageSlug: stage.slug,
                    })}
                    passHref
                  >
                    <a
                      data-testid={`categorylink`}
                      className="text-theme-600 hover:text-theme-800 pr-12 md:px-12 lg:px-12 truncate"
                    >
                      {stage.name}
                    </a>
                  </Link> */}
                </div>
                <div className="absolute top-0.5 right-0">
                  <button
                    id={"edit-" + stage.id}
                    className="float-right text-indigo-600 hover:text-indigo-800"
                    title="Configure Score Card"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(
                        Routes.JobSettingsSingleScoreCardPage({
                          slug: jobSlug,
                          stageSlug: stage.slug,
                        })
                      )
                    }}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                  </button>
                </div>
                {stage.allowEdit && (
                  <>
                    <div className="absolute top-0.5 right-6">
                      <button
                        id={"edit-" + stage.id}
                        className="float-right text-indigo-600 hover:text-indigo-800"
                        title="Edit Stage Name"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setStageToEdit(stage)
                          setOpenAddNewStage(true)
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-0.5 right-12">
                      <button
                        className="float-right text-red-600 hover:text-red-800"
                        title="Delete Stage"
                        onClick={async (e) => {
                          e.preventDefault()

                          if (activePlanName === PlanName.FREE) {
                            setOpenUpgradeConfirm(true)
                            return
                          }

                          if (stage?.candidates?.length === 0) {
                            setWorkflowStageToRemove(stage)
                            setOpenConfirm(true)
                          } else {
                            alert("Can't delete the stage as there are some candidates present.")
                          }
                        }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden md:block lg:block border-b-2 border-gray-50 w-full"></div>
              <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                {stage.scoreCardQuestions
                  // ?.sort((a, b) => {
                  //   return a.order - b.order
                  // })
                  .map((question) => {
                    return (
                      <div
                        key={question.id}
                        className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                      >
                        <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                          {question?.title}
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="hidden md:block lg:block border-b-2 border-gray-50 w-full"></div>
              <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                <div className="text-neutral-500 font-semibold flex">
                  {stage?.candidates?.length}{" "}
                  {stage?.candidates?.length === 1 ? "Candidate" : "Candidates"}
                </div>
              </div>
            </div>
          </>
        ),
      }
    }) as CardType[]
  }

  const [cards, setCards] = useState(getCards(data, job?.slug || "0"))
  useEffect(() => {
    setCards(getCards(data, job?.slug || "0"))
  }, [data])

  return (
    <>
      {/* <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div> */}
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

      <Confirm
        open={openUpgradeConfirm}
        setOpen={setOpenUpgradeConfirm}
        header="Upgrade to recruiter plan"
        cancelText="Ok"
        hideConfirm={true}
        onSuccess={async () => {
          setOpenConfirm(false)
          setOpenUpgradeConfirm(false)
          setWorkflowStageToRemove(null)
        }}
      >
        Upgrade to recruiter plan for customising hiring stages.
      </Confirm>

      <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
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
      <div className="w-full flex items-center justify-center px-4 md:p-0">
        <div className="w-full md:w-5/6 lg:w-4/5 p-3 border-2 border-theme-400 rounded">
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
  activePlanName,
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

  const [openUpgradeConfirm, setOpenUpgradeConfirm] = React.useState(false)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Hiring Stages" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <div className="px-4 mt-6 md:p-0 md:mt-0 flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
            <div className="sm:mr-5">
              <h2 className="text-lg leading-6 font-medium text-gray-900">Stages & Score Cards</h2>
              <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                Add and re-order hiring stages for this job
              </h4>
              <h4 className="text-xs sm:text-sm text-gray-700">
                Click on the card icon to configure stage score card
              </h4>
              {activePlanName === PlanName.FREE && (
                <div className="mt-2">
                  <UpgradeMessage message="Upgrade to add more stages" />
                </div>
              )}
            </div>
            <Modal header="Add New Stage" open={openAddNewStage} setOpen={setOpenAddNewStage}>
              <StageForm
                header={`${stageToEdit ? "Update" : "Add New"} Stage`}
                subHeader=""
                initialValues={stageToEdit ? { name: stageToEdit?.name } : {}}
                onSubmit={async (values) => {
                  if (activePlanName === PlanName.FREE) {
                    setStageToEdit(null as any)
                    setOpenAddNewStage(false)
                    setOpenUpgradeConfirm(true)
                    return
                  }

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
              className="float-right text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
            >
              Add New Stage
            </button>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<p className="pt-3">Loading...</p>}>
              <Stages
                job={job}
                user={user}
                setStageToEdit={setStageToEdit}
                setOpenAddNewStage={setOpenAddNewStage}
                activePlanName={activePlanName}
                openUpgradeConfirm={openUpgradeConfirm}
                setOpenUpgradeConfirm={setOpenUpgradeConfirm}
              />
            </Suspense>
          </div>
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsStagesPage
