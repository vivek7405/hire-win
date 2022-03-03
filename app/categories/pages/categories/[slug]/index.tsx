import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Link,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useMutation,
  useRouter,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getCategory from "app/categories/queries/getCategory"
import CategoryForm from "app/categories/components/CategoryForm"
import toast from "react-hot-toast"
import updateCategory from "app/categories/mutations/updateCategory"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const { can: canUpdate } = await Guard.can(
    "update",
    "category",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      const category = await invokeWithMiddleware(
        getCategory,
        { where: { slug: context?.params?.slug! } },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          category: category,
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
        destination: `/login?next=/categories/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleCategoryPage = ({
  user,
  category,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCategoryMutation] = useMutation(updateCategory)
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <CategoryForm
        header="Category Details"
        subHeader="Update category details"
        initialValues={{
          name: category?.name,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Category</span>)
          try {
            await updateCategoryMutation({
              where: { slug: category?.slug },
              data: { ...values },
              initial: category!,
            })
            toast.success(() => <span>Category Updated</span>, { id: toastId })
            router.push(Routes.CategoriesHome())
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />
    </AuthLayout>
  )
}

export default SingleCategoryPage
