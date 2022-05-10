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

import getForms from "app/admin/queries/admin/getForms"
import updateForm from "app/admin/mutations/admin/updateForm"

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
    const foundForm = await invokeWithMiddleware(
      getForms,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundForm: foundForm.forms[0],
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

const SingleFormAdminPage = ({
  user,
  foundForm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateFormMutation] = useMutation(updateForm)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundForm}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Form</span>)
            try {
              await updateFormMutation({
                where: { id: foundForm?.id },
                data: { ...values },
              })
              toast.success(() => <span>Form Updated</span>, { id: toastId })
              router.push(Routes.AdminForm())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundForm?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="questions" label="questions" disabled />
          <LabeledTextField name="jobs" label="jobs" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleFormAdminPage
