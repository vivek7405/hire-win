import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import CategoryForm from "app/categories/components/CategoryForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createCategory from "app/categories/mutations/createCategory"
import path from "path"
import { convertToRaw } from "draft-js"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
}

const NewCategory = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createCategoryMutation] = useMutation(createCategory)

  return (
    <AuthLayout title="New Category" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <CategoryForm
          header="Create A New Category"
          subHeader="Enter your category details."
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Category</span>)
            try {
              await createCategoryMutation(values)
              toast.success(() => <span>Category Created</span>, { id: toastId })
              router.push(Routes.CategoriesHome())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
        />
      </div>
    </AuthLayout>
  )
}

export default NewCategory
