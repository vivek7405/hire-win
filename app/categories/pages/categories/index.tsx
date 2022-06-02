import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  useQuery,
  useSession,
  useMutation,
  invalidateQuery,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import { Category, Job } from "@prisma/client"
import { CardType, DragDirection, ExtendedCategory } from "types"
import Debouncer from "app/core/utils/debouncer"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import Cards from "app/core/components/Cards"
import Confirm from "app/core/components/Confirm"
import toast from "react-hot-toast"
import deleteCategory from "app/categories/mutations/deleteCategory"
import Card from "app/core/components/Card"
import Modal from "app/core/components/Modal"
import CategoryForm from "app/categories/components/CategoryForm"
import createCategory from "app/categories/mutations/createCategory"
import updateCategory from "app/categories/mutations/updateCategory"
import { TrashIcon } from "@heroicons/react/outline"

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

const Categories = () => {
  const router = useRouter()
  const session = useSession()
  const [query, setQuery] = useState({})

  const [openConfirm, setOpenConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null as any as Category)
  const [deleteCategoryMutation] = useMutation(deleteCategory)
  const [categoryToEdit, setCategoryToEdit] = useState(null as any as Category)
  const [openModal, setOpenModal] = useState(false)
  const [createCategoryMutation] = useMutation(createCategory)
  const [updateCategoryMutation] = useMutation(updateCategory)

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

  const [categories] = useQuery(getCategoriesWOPagination, {
    where: {
      companyId: session.companyId || 0,
      ...query,
    },
  })

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
        header={`Delete Category - ${categoryToDelete?.name}`}
        onSuccess={async () => {
          const toastId = toast.loading(`Deleting Category`)
          try {
            await deleteCategoryMutation({ where: { id: categoryToDelete?.id } })
            toast.success("Category Deleted", { id: toastId })
            setOpenConfirm(false)
            setCategoryToDelete(null as any)
            invalidateQuery(getCategoriesWOPagination)
          } catch (error) {
            toast.error(`Deleting category failed - ${error.toString()}`, { id: toastId })
          }
        }}
      >
        Are you sure you want to delete the category?
      </Confirm>
      <button
        className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
        onClick={(e) => {
          e.preventDefault()
          setCategoryToEdit(null as any)
          setOpenModal(true)
        }}
      >
        New Category
      </button>

      <Modal header="Category" open={openModal} setOpen={setOpenModal}>
        <CategoryForm
          header={`${categoryToEdit ? "Update" : "New"} Category`}
          subHeader=""
          initialValues={categoryToEdit ? { name: categoryToEdit?.name } : {}}
          onSubmit={async (values) => {
            const isEdit = categoryToEdit ? true : false

            const toastId = toast.loading(isEdit ? "Updating Category" : "Creating Category")
            try {
              isEdit
                ? await updateCategoryMutation({
                    where: { id: categoryToEdit.id },
                    data: { ...values },
                    initial: categoryToEdit,
                  })
                : await createCategoryMutation({ ...values })
              await invalidateQuery(getCategoriesWOPagination)
              toast.success(
                isEdit ? "Category updated successfully" : "Category added successfully",
                { id: toastId }
              )
              setCategoryToEdit(null as any)
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
      {categories?.length === 0 ? (
        <div className="text-xl font-semibold text-neutral-500">No Categories found</div>
      ) : (
        <div className="flex flex-wrap justify-center mt-2">
          {categories.map((c) => {
            return (
              <Card key={c.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex md:justify-center lg:justify:center items-center">
                      <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800"
                        onClick={(e) => {
                          e.preventDefault()
                          setCategoryToEdit(c)
                          setOpenModal(true)
                        }}
                      >
                        {c.name}
                      </a>
                      {/* <Link href={Routes.SingleCategoryPage({ slug: c.slug })} passHref>
                        <a className="cursor-pointer text-theme-600 hover:text-theme-800">
                          {c.name}
                        </a>
                      </Link> */}
                    </div>
                    <div className="absolute top-0.5 right-0">
                      <button
                        id={"delete-" + c.id}
                        className="float-right text-red-600 hover:text-red-800"
                        title="Delete Category"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCategoryToDelete(c)
                          setOpenConfirm(true)
                        }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex md:justify-center lg:justify-center">
                    {c.jobs.length} {c.jobs.length === 1 ? "Job" : "Jobs"}
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

const CategoriesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="CategoriesHome | hire-win" user={user}>
      {/* <Link href={Routes.NewCategory()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Category
        </a>
      </Link> */}

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <Categories />
      </Suspense>
    </AuthLayout>
  )
}

CategoriesHome.authenticate = true

export default CategoriesHome
