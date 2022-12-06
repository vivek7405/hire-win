import { gSSP } from "src/blitz-server";
import { useMutation } from "@blitzjs/rpc";
import { Routes } from "@blitzjs/next";
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import AuthLayout from "src/core/layouts/AuthLayout"
import CategoryForm from "src/categories/components/CategoryForm"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import createCategory from "src/categories/mutations/createCategory"
import path from "path"
import { convertToRaw } from "draft-js"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
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
        destination: "/auth/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
})

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
