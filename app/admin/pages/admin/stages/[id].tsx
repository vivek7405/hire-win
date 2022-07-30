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

import getStages from "app/admin/queries/admin/getStages"
import updateStage from "app/admin/mutations/admin/updateStage"

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
    const foundStage = await invokeWithMiddleware(
      getStages,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundStage: foundStage.stages[0],
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

const SingleStageAdminPage = ({
  user,
  foundStage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateStageMutation] = useMutation(updateStage)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundStage}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Stage</span>)
            try {
              await updateStageMutation({
                where: { id: foundStage?.id },
                data: { ...values },
              })
              toast.success(() => <span>Stage Updated</span>, { id: toastId })
              router.push(Routes.AdminStage())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundStage?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="createdBy" label="createdBy" disabled />
          <LabeledTextField name="createdById" label="createdById" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="allowEdit" label="allowEdit" disabled />
          <LabeledTextField name="workflows" label="workflows" disabled />
          <LabeledTextField name="company" label="company" disabled />
          <LabeledTextField name="companyId" label="companyId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleStageAdminPage
