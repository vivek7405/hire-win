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
import Table from "src/core/components/Table"

import { Category, Job } from "@prisma/client"
import { CardType, DragDirection, ExtendedCategory } from "types"
import Debouncer from "src/core/utils/debouncer"
import getCategoriesWOPagination from "src/categories/queries/getCategoriesWOPagination"
import Cards from "src/core/components/Cards"
import Confirm from "src/core/components/Confirm"
import toast from "react-hot-toast"
import deleteCategory from "src/categories/mutations/deleteCategory"
import Card from "src/core/components/Card"
import Modal from "src/core/components/Modal"
import CategoryForm from "src/categories/components/CategoryForm"
import createCategory from "src/categories/mutations/createCategory"
import updateCategory from "src/categories/mutations/updateCategory"
import { TrashIcon } from "@heroicons/react/outline"
import getCategories from "src/categories/queries/getCategories"
import Pagination from "src/core/components/Pagination"
import { PencilIcon } from "@heroicons/react/solid"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
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
        destination: "/auth/login",
        permanent: false,
      },
      props: {},
    }
  }
})

const Categories = () => {
  const ITEMS_PER_PAGE = 25
  const router = useRouter()
  const tablePage = Number(router.query.page) || 0
  const session = useSession()
  const [query, setQuery] = useState({})

  const [openConfirm, setOpenConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null as Category | null)
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

  const [{ categories, hasMore, count }] = usePaginatedQuery(getCategories, {
    where: {
      companyId: session.companyId || "0",
      ...query,
    },
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
            if (!categoryToDelete) {
              throw new Error("No category set to delete")
            }
            await deleteCategoryMutation({ where: { id: categoryToDelete.id } })
            invalidateQuery(getCategories)
            toast.success("Category Deleted", { id: toastId })
          } catch (error) {
            toast.error(`Deleting category failed - ${error.toString()}`, { id: toastId })
          }
          setOpenConfirm(false)
          setCategoryToDelete(null)
        }}
      >
        Are you sure you want to delete the category?
      </Confirm>

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
                  })
                : await createCategoryMutation({ ...values })
              await invalidateQuery(getCategories)
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

      <div>
        <button
          className="float-right text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700 whitespace-nowrap"
          onClick={(e) => {
            e.preventDefault()
            setCategoryToEdit(null as any)
            setOpenModal(true)
          }}
        >
          New Job Category
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
        resultName="category"
      />

      {categories?.length > 0 && (
        <div className="flex flex-wrap justify-center max-w-md mx-auto">
          {categories.map((c) => {
            return (
              <Card isFull={true} key={c.id}>
                <div className="space-y-2">
                  <div className="w-full relative">
                    <div className="font-bold flex items-center text-neutral-600">
                      {/* <a
                        className="cursor-pointer text-theme-600 hover:text-theme-800 pr-12 truncate"
                        onClick={(e) => {
                          e.preventDefault()
                          setCategoryToEdit(c)
                          setOpenModal(true)
                        }}
                      > */}
                      <div className="pr-12 text-neutral-700 truncate">{c.name}</div>
                      {/* </a> */}
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
                    <div className="absolute top-0.5 right-6">
                      <button
                        id={"edit-" + c.id}
                        className="float-right text-indigo-600 hover:text-indigo-800"
                        title="Edit Candidate Pool"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCategoryToEdit(c)
                          setOpenModal(true)
                        }}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="border-b-2 border-gray-50 w-full"></div>
                  <div className="text-neutral-500 font-semibold flex">
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
    <AuthLayout title="Hire.win | Categories" user={user}>
      {/* <Link legacyBehavior prefetch={true} href={Routes.NewCategory()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700">
          New Category
        </a>
      </Link> */}
      <div className="mb-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Job Categories</h2>
        <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
          Job categories help filter the jobs by department
        </h4>
      </div>

      <Suspense fallback="Loading...">
        <Categories />
      </Suspense>
    </AuthLayout>
  )
}

CategoriesHome.authenticate = true

export default CategoriesHome
