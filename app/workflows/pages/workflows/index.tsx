import { useEffect, useState, useMemo, Suspense, ReactNode } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
  useSession,
  invalidateQuery,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getWorkflows from "app/workflows/queries/getWorkflows"
import Table from "app/core/components/Table"

import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import Cards from "app/core/components/Cards"
import { CardType, DragDirection } from "types"
import { CogIcon, PencilIcon, TrashIcon } from "@heroicons/react/outline"
import Debouncer from "app/core/utils/debouncer"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "app/core/components/Modal"
import WorkflowForm from "app/workflows/components/WorkflowForm"
import Card from "app/core/components/Card"
import deleteWorkflow from "app/workflows/mutations/deleteWorkflow"
import createWorkflow from "app/workflows/mutations/createWorkflow"
import { Workflow } from "@prisma/client"
import updateWorkflow from "app/workflows/mutations/updateWorkflow"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const Workflows = () => {
  const router = useRouter()
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState(null as any as Workflow)
  const [deleteWorkflowMutation] = useMutation(deleteWorkflow)
  const [workflowToEdit, setWorkflowToEdit] = useState(null as any as Workflow)
  const [openModal, setOpenModal] = useState(false)
  const [createWorkflowMutation] = useMutation(createWorkflow)
  const [updateWorkflowMutation] = useMutation(updateWorkflow)

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

  const [workflows] = useQuery(getWorkflowsWOPagination, {
    where: {
      companyId: session.companyId || "0",
      ...query,
    },
  })

  const searchQuery = async (e) => {
    const searchQuery = { search: JSON.stringify(e.target.value) }
    router.push({
      query: {
        ...router.query,
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
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Workflow - ${workflowToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Workflow`)
          try {
            await deleteWorkflowMutation({ id: workflowToDelete?.id })
            toast.success("Workflow Deleted", { id: toastId })
            setOpenConfirm(false)
            setWorkflowToDelete(null as any)
            invalidateQuery(getWorkflowsWOPagination)
          } catch (error) {
            toast.error(`Deleting workflow failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the workflow?
      </Confirm>

      <Modal header="Workflow" open={openModal} setOpen={setOpenModal}>
        <WorkflowForm
          header={`${workflowToEdit ? "Update" : "New"} Workflow`}
          subHeader=""
          initialValues={workflowToEdit ? { name: workflowToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = workflowToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Workflow" : "Creating Workflow")
            try {
              isEdit
                ? await updateWorkflowMutation({
                    where: { id: workflowToEdit.id },
                    data: { ...values },
                    initial: workflowToEdit,
                  })
                : await createWorkflowMutation({ ...values })
              await invalidateQuery(getWorkflowsWOPagination)
              toast.success(
                isEdit ? "Workflow updated successfully" : "Workflow added successfully",
                {
                  id: toastId,
                }
              )
              setWorkflowToEdit(null as any)
              setOpenModal(false)
            } catch (error) {
              toast.error(
                `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                { id: toastId }
              )
            }
          }}
        />
      </Modal>

      <div>
        <button
          className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700 whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault()
            setWorkflowToEdit(null as any)
            setOpenModal(true)
          }}
        >
          New Workflow
        </button>
      </div>
      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
          className={`border border-gray-300 mr-2 md:w-1/4 lg:w-1/4 px-2 py-2 w-full rounded`}
          onChange={(e) => {
            execDebouncer(e)
          }}
        />
      </div>

      {workflows?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Workflows found</div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {workflows.map((w) => {
            return (
              <Card isFull={true} key={w.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="text-lg font-bold flex md:justify-center lg:justify:center items-center">
                      <Link
                        prefetch={true}
                        href={Routes.SingleWorkflowPage({ slug: w.slug })}
                        passHref
                      >
                        <a
                          data-testid={`categorylink`}
                          className="text-theme-600 hover:text-theme-800"
                        >
                          {w.name}
                        </a>
                      </Link>
                    </div>
                    {!w.factory && (
                      <>
                        <div className="absolute top-0.5 right-5">
                          {w.companyId === session.companyId && (
                            <button
                              id={"edit-" + w.id}
                              className="float-right text-indigo-600 hover:text-indigo-800"
                              title="Edit Workflow"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setWorkflowToEdit(w)
                                setOpenModal(true)
                              }}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <div className="absolute top-0.5 right-0">
                          <button
                            id={"delete-" + w.id}
                            className="float-right text-red-600 hover:text-red-800"
                            title="Delete Workflow"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setWorkflowToDelete(w)
                              setOpenConfirm(true)
                            }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {`${w.stages?.length} ${w.stages?.length === 1 ? "Stage" : "Stages"} · ${
                      w.jobs?.length
                    } ${w.jobs?.length === 1 ? "Job" : "Jobs"}`}
                  </div>
                  <div className="hidden md:flex lg:flex mt-2 items-center md:justify-center lg:justify-center space-x-2">
                    {w.stages
                      // ?.sort((a, b) => {
                      //   return a.order - b.order
                      // })
                      .map((ws) => {
                        return (
                          <div
                            key={ws.id}
                            className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                          >
                            <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center truncate">
                              {ws.stage?.name}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

const WorkflowsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="WorkflowsHome | hire-win" user={user}>
      {/* <Link prefetch={true} href={Routes.NewWorkflow()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Workflow
        </a>
      </Link> */}

      {/* <Link prefetch={true} href={Routes.StagesHome()} passHref>
        <a className="float-right underline text-theme-600 mx-6 py-2 hover:text-theme-800">
          Stage Pool
        </a>
      </Link> */}

      <Suspense fallback="Loading...">
        <Workflows />
      </Suspense>
    </AuthLayout>
  )
}

WorkflowsHome.authenticate = true

export default WorkflowsHome
