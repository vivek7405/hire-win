import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
  useMutation,
  invalidateQuery,
  useSession,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getCandidatePools from "app/candidate-pools/queries/getCandidatePools"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import { CandidatePool, Job } from "@prisma/client"
import { CardType, DragDirection, ExtendedCandidatePool } from "types"
import Debouncer from "app/core/utils/debouncer"
import Cards from "app/core/components/Cards"
import Modal from "app/core/components/Modal"
import CandidatePoolForm from "app/candidate-pools/components/CandidatePoolForm"
import toast from "react-hot-toast"
import createCandidatePool from "app/candidate-pools/mutations/createCandidatePool"
import updateCandidatePool from "app/candidate-pools/mutations/updateCandidatePool"
import deleteCandidatePool from "app/candidate-pools/mutations/deleteCandidatePool"
import Confirm from "app/core/components/Confirm"
import Card from "app/core/components/Card"
import { PencilIcon, TrashIcon } from "@heroicons/react/outline"

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
        destination: "/login?next=/candidate-pools",
        permanent: false,
      },
      props: {},
    }
  }
}

const CandidatePools = ({ user }) => {
  const router = useRouter()
  const session = useSession()
  const [query, setQuery] = useState({})
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [createCandidatePoolMutation] = useMutation(createCandidatePool)
  const [updateCandidatePoolMutation] = useMutation(updateCandidatePool)
  const [candidatePools] = useQuery(getCandidatePools, {
    where: { companyId: session.companyId || 0, ...query },
  })
  const [deleteCandidatePoolMutation] = useMutation(deleteCandidatePool)
  const [candidatePoolToEdit, setCandidatePoolToEdit] = useState(null as any as CandidatePool)
  const [candidatePoolToDelete, setCandidatePoolToDelete] = useState(null as any as CandidatePool)

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
            await deleteCandidatePoolMutation(candidatePoolToDelete?.id)
            toast.success("Candidate Pool Deleted", { id: toastId })
            setOpenConfirm(false)
            setCandidatePoolToDelete(null as any)
            invalidateQuery(getCandidatePools)
          } catch (error) {
            toast.error(`Deleting candidate pool failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the candidate pool?
      </Confirm>
      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setCandidatePoolToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Candidate Pool
      </button>

      <Modal header="Candidate Pool" open={openModal} setOpen={setOpenModal}>
        <CandidatePoolForm
          header={`${candidatePoolToEdit ? "Update" : "New"} Candidate Pool`}
          subHeader=""
          initialValues={candidatePoolToEdit ? { name: candidatePoolToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = candidatePoolToEdit ? true : false

            const toastId = toast.loading(
              isEdit ? "Updating Candidate Pool" : "Creating Candidate Pool"
            )
            try {
              isEdit
                ? await updateCandidatePoolMutation({
                    where: { id: candidatePoolToEdit.id },
                    data: { ...values },
                    initial: candidatePoolToEdit,
                  })
                : await createCandidatePoolMutation({ ...values })
              await invalidateQuery(getCandidatePools)
              toast.success(
                isEdit
                  ? "Candidate Pool updated successfully"
                  : "Candidate Pool added successfully",
                { id: toastId }
              )
              setCandidatePoolToEdit(null as any)
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
      <br />
      {candidatePools?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Candidate Pools found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {candidatePools.map((cp) => {
            return (
              <Card key={cp.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      <Link href={Routes.SingleCandidatePoolPage({ slug: cp.slug })} passHref>
                        <a className="cursor-pointer text-theme-600 hover:text-theme-800">
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
                    <div className="absolute top-0.5 right-4">
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
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
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

const CandidatePoolsHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="CandidatePoolsHome | hire-win" user={user}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <CandidatePools user={user} />
      </Suspense>
    </AuthLayout>
  )
}

CandidatePoolsHome.authenticate = true

export default CandidatePoolsHome
