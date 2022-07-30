import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useSession,
  useMutation,
  useQuery,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getStages from "app/stages/queries/getStages"
import Table from "app/core/components/Table"

import { Stage } from "@prisma/client"
import { CardType, DragDirection } from "types"
import Cards from "app/core/components/Cards"
import Card from "app/core/components/Card"
import Pagination from "app/core/components/Pagination"
import Debouncer from "app/core/utils/debouncer"
import deleteStage from "app/stages/mutations/deleteStage"
import createStage from "app/stages/mutations/createStage"
import updateStage from "app/stages/mutations/updateStage"
import { TrashIcon } from "@heroicons/react/outline"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import Modal from "app/core/components/Modal"
import StageForm from "app/stages/components/StageForm"

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
        destination: "/login?next=/stages",
        permanent: false,
      },
      props: {},
    }
  }
}

const Stages = () => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const [query, setQuery] = useState({})
  const session = useSession()

  const [openConfirm, setOpenConfirm] = useState(false)
  const [stageToDelete, setStageToDelete] = useState(null as any as Stage)
  const [deleteStageMutation] = useMutation(deleteStage)
  const [stageToEdit, setStageToEdit] = useState(null as any as Stage)
  const [openModal, setOpenModal] = useState(false)
  const [createStageMutation] = useMutation(createStage)
  const [updateStageMutation] = useMutation(updateStage)

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

  const [{ stages, hasMore, count }] = usePaginatedQuery(getStages, {
    where: {
      companyId: session.companyId || "0",
      ...query,
    },
    orderBy: { allowEdit: "asc" },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  if (endPage > count) {
    endPage = count
  }

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
        header={`Delete Stage - ${stageToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Stage`)
          try {
            await deleteStageMutation({ id: stageToDelete?.id })
            toast.success("Stage Deleted", { id: toastId })
            invalidateQuery(getStages)
          } catch (error) {
            toast.error(`Deleting stage failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setStageToDelete(null as any)
        }}
      >
        Are you sure you want to delete the stage?
      </Confirm>

      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setStageToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Stage
      </button>

      <Modal header="Stage" open={openModal} setOpen={setOpenModal}>
        <StageForm
          header={`${stageToEdit ? "Update" : "New"} Stage`}
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
                : await createStageMutation({ ...values })
              await invalidateQuery(getStages)
              toast.success(isEdit ? "Stage updated successfully" : "Stage added successfully", {
                id: toastId,
              })
              setStageToEdit(null as any)
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

      <input
        placeholder="Search"
        type="text"
        defaultValue={router.query.search?.toString().replaceAll('"', "") || ""}
        className={`border border-gray-300 md:mr-2 lg:mr-2 lg:w-1/4 px-2 py-2 w-full rounded`}
        onChange={(e) => {
          execDebouncer(e)
        }}
      />

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="stage"
      />

      {stages?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Stages found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {stages.map((s) => {
            return (
              <Card key={s.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      {s.allowEdit ? (
                        <a
                          className="cursor-pointer text-theme-600 hover:text-theme-800 pr-6 md:px-6 lg:px-6 truncate"
                          onClick={(e) => {
                            e.preventDefault()
                            setStageToEdit(s)
                            setOpenModal(true)
                          }}
                        >
                          {s.name}
                        </a>
                      ) : (
                        <span className="truncate">{s.name}</span>
                      )}
                    </div>
                    {s.allowEdit && (
                      <div className="absolute top-0.5 right-0">
                        <button
                          id={"delete-" + s.id}
                          className="float-right text-red-600 hover:text-red-800"
                          title="Delete Stage"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setStageToDelete(s)
                            setOpenConfirm(true)
                          }}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {s._count.workflows} {s._count.workflows === 1 ? "Workflow" : "Workflows"}
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

const StagesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="StagesHome | hire-win" user={user}>
      <Suspense fallback="Loading...">
        <Stages />
      </Suspense>
    </AuthLayout>
  )
}

StagesHome.authenticate = true

export default StagesHome
