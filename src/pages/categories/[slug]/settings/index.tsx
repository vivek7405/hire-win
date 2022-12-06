import { gSSP } from "src/blitz-server"
import { getSession, useSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React from "react"
import path from "path"

import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "src/guard/ability"

import CategoryForm from "src/categories/components/CategoryForm"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import updateCategory from "src/categories/mutations/updateCategory"
import getCategory from "src/categories/queries/getCategory"
import getUser from "src/users/queries/getUser"
import { AuthorizationError } from "blitz"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking

  // const user = await getCurrentUserServer({ ...context })
  // const session = await getSession(context.req, context.res)

  const { can: canUpdate } = await Guard.can(
    "update",
    "category",
    { ...context.ctx },
    { where: { slug: context?.params?.slug! } }
  )

  const user = await getUser(
    { where: { id: context.ctx.session.userId || "0" } },
    { ...context.ctx }
  )

  if (user) {
    try {
      if (canUpdate) {
        const category = await getCategory(
          { where: { slug: (context?.params?.slug as string) || "0" } },
          { ...context.ctx }
        )

        return {
          props: {
            user: user,
            category: category,
            canUpdate,
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
        destination: `/auth/login?next=/categories/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
})

const CategorySettingsPage = ({
  user,
  category,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
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
              where: {
                companyId_slug: {
                  companyId: session.companyId || "0",
                  slug: category?.slug!,
                },
              },
              data: { ...values },
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

export default CategorySettingsPage
