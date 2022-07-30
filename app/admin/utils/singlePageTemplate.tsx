// @ts-nocheck
import React from "react"
import {
  Routes,
  useRouter,
  useMutation,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
} from "blitz"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"

import get__ModelName__s from "app/admin/queries/admin/get__ModelName__s"
import update__ModelName__ from "app/admin/mutations/admin/update__ModelName__"

import { Form } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import toast from "react-hot-toast"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const found__ModelName__ = await invokeWithMiddleware(
      get__ModelName__s,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        found__ModelName__: found__ModelName__.__modelName__s[0],
      },
    }
  } else {
    return {
      redirect: {
        destination: `/login`,
        permanent: false,
      },
      props: {},
    }
  }
}

const Single__ModelName__AdminPage = ({
  user,
  found__ModelName__,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [update__ModelName__Mutation] = useMutation(update__ModelName__)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={found__ModelName__}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating __ModelName__</span>)
            try {
              await update__ModelName__Mutation({
                where: { id: found__ModelName__?.id },
                data: { ...values },
              })
              toast.success(() => <span>__ModelName__ Updated</span>, { id: toastId })
              router.push(Routes.Admin__ModelName__())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={found__ModelName__?.id}
          subHeader={``}
        ></Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default Single__ModelName__AdminPage
