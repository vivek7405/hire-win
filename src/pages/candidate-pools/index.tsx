import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useSession } from "@blitzjs/auth"
import { usePaginatedQuery, useQuery, useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, useMemo, Suspense } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import getCandidatePoolsWOPagination from "src/candidate-pools/queries/getCandidatePoolsWOPagination"
import Table from "src/core/components/Table"

import { CandidatePool, Job } from "@prisma/client"
import { CardType, DragDirection, ExtendedCandidatePool, PlanName } from "types"
import Debouncer from "src/core/utils/debouncer"
import Cards from "src/core/components/Cards"
import Modal from "src/core/components/Modal"
import CandidatePoolForm from "src/candidate-pools/components/CandidatePoolForm"
import toast from "react-hot-toast"
import createCandidatePool from "src/candidate-pools/mutations/createCandidatePool"
import updateCandidatePool from "src/candidate-pools/mutations/updateCandidatePool"
import deleteCandidatePool from "src/candidate-pools/mutations/deleteCandidatePool"
import Confirm from "src/core/components/Confirm"
import Card from "src/core/components/Card"
import { TrashIcon } from "@heroicons/react/outline"
import getCandidatePools from "src/candidate-pools/queries/getCandidatePools"
import Pagination from "src/core/components/Pagination"
import { PencilIcon } from "@heroicons/react/solid"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import UpgradeMessage from "src/plans/components/UpgradeMessage"
import { e } from "@blitzjs/auth/dist/index-834e37b5"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    return { props: { user, activePlanName } }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=/candidate-pools",
        permanent: false,
      },
      props: {},
    }
  }
})

const CandidatePools = ({ activePlanName }) => {
  const ITEMS_PER_PAGE = 12
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const session = useSession()
  const [query, setQuery] = useState({})
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [createCandidatePoolMutation] = useMutation(createCandidatePool)
  const [updateCandidatePoolMutation] = useMutation(updateCandidatePool)
  const [deleteCandidatePoolMutation] = useMutation(deleteCandidatePool)
  const [candidatePoolToEdit, setCandidatePoolToEdit] = useState(null as CandidatePool | null)
  const [candidatePoolToDelete, setCandidatePoolToDelete] = useState(null as CandidatePool | null)
  const [openUpgradeConfirm, setOpenUpgradeConfirm] = useState(false)

  const [{ candidatePools, hasMore, count }] = usePaginatedQuery(getCandidatePools, {
    where: { companyId: session.companyId || "0", ...query },
    skip: ITEMS_PER_PAGE * Number(tablePage),
    take: ITEMS_PER_PAGE,
  })

  let startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  if (endPage > count) {
    endPage = count
  }

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
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header={`Delete Candidate Pool - ${candidatePoolToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Candidate Pool`)
          try {
            if (!candidatePoolToDelete) {
              throw new Error("No candidate pool set to delete")
            }
            await deleteCandidatePoolMutation({ where: { id: candidatePoolToDelete.id } })
            toast.success("Candidate Pool Deleted", { id: toastId })
            invalidateQuery(getCandidatePools)
          } catch (error) {
            toast.error(`Deleting candidate pool failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setCandidatePoolToDelete(null)
        }}
      >
        Are you sure you want to delete the candidate pool?
      </Confirm>

      <Confirm
        open={openUpgradeConfirm}
        setOpen={setOpenUpgradeConfirm}
        header="Upgrade to recruiter plan"
        cancelText="Ok"
        hideConfirm={true}
        onSuccess={async () => {
          setOpenUpgradeConfirm(false)
        }}
      >
        Upgrade to recruiter plan for adding/editing candidate pools.
      </Confirm>

      <Modal header="Candidate Pool" open={openModal} setOpen={setOpenModal}>
        <CandidatePoolForm
          header={`${candidatePoolToEdit ? "Update" : "New"} Candidate Pool`}
          subHeader=""
          initialValues={candidatePoolToEdit ? { name: candidatePoolToEdit?.name } : {}}
          onSubmit={async (values) => {
            if (activePlanName === PlanName.FREE) {
              setCandidatePoolToEdit(null)
              setOpenModal(false)
              setOpenUpgradeConfirm(true)
              return
            }

            const isEdit = candidatePoolToEdit ? true : false

            const toastId = toast.loading(
              isEdit ? "Updating Candidate Pool" : "Creating Candidate Pool"
            )
            try {
              if (isEdit) {
                if (candidatePoolToEdit) {
                  await updateCandidatePoolMutation({
                    where: { id: candidatePoolToEdit?.id },
                    data: { ...values },
                    initial: candidatePoolToEdit,
                  })
                } else {
                  toast.error("No candidate pool is set for editing", { id: toastId })
                  return
                }
              } else {
                await createCandidatePoolMutation({ ...values })
              }
              await invalidateQuery(getCandidatePools)
              toast.success(
                isEdit
                  ? "Candidate Pool updated successfully"
                  : "Candidate Pool added successfully",
                { id: toastId }
              )
              setCandidatePoolToEdit(null)
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
            setCandidatePoolToEdit(null)
            setOpenModal(true)
          }}
        >
          New Candidate Pool
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

      <Pagination
        endPage={endPage}
        hasNext={hasMore}
        hasPrevious={tablePage !== 0}
        pageIndex={tablePage}
        startPage={startPage}
        totalCount={count}
        resultName="candidate pool"
      />

      {candidatePools?.length > 0 && (
        <div className="flex flex-wrap justify-center max-w-md mx-auto">
          {candidatePools.map((cp) => {
            return (
              <Card isFull={true} key={cp.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex items-center">
                      <Link
                        prefetch={true}
                        href={Routes.SingleCandidatePoolPage({ slug: cp.slug })}
                        passHref
                        legacyBehavior
                      >
                        <a className="cursor-pointer text-theme-600 hover:text-theme-800 pr-12 truncate">
                          {cp.name}
                        </a>
                      </Link>
                    </div>
                    <div className="absolute top-0.5 right-0">
                      <button
                        id={"delete-" + cp.id}
                        className="float-right text-red-600 hover:text-red-800"
                        title="Delete Candidate Pool"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCandidatePoolToDelete(cp)
                          setOpenConfirm(true)
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-0.5 right-6">
                      <button
                        id={"edit-" + cp.id}
                        className="float-right text-indigo-600 hover:text-indigo-800"
                        title="Edit Candidate Pool"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCandidatePoolToEdit(cp)
                          setOpenModal(true)
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex">
                    {cp._count.candidates} {cp._count.candidates === 1 ? "Candidate" : "Candidates"}
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

const CandidatePoolsHome = ({
  user,
  activePlanName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Hire.win | Candidate Pools" user={user}>
      <div className="mb-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Candidate Pools</h2>
        <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
          Candidate Pools are databases of candidates for future reference
        </h4>
        <h4 className="text-xs sm:text-sm text-gray-700">
          While in the candidate detail page, you shall see a Pools dropdown. Add/remove the
          candidate to pools using that dropdown.
        </h4>
        {activePlanName === PlanName.FREE && (
          <div className="mt-2 w-full md:w-2/3 lg:w-3/5 xl:w-1/2">
            <UpgradeMessage message="Upgrade to add more Candidate Pools" />
          </div>
        )}
      </div>

      <Suspense fallback="Loading...">
        <CandidatePools activePlanName={activePlanName} />
      </Suspense>
    </AuthLayout>
  )
}

CandidatePoolsHome.authenticate = true

export default CandidatePoolsHome
