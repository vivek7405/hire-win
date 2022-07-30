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

import getEmails from "app/admin/queries/admin/getEmails"
import updateEmail from "app/admin/mutations/admin/updateEmail"

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
    const foundEmail = await invokeWithMiddleware(
      getEmails,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundEmail: foundEmail.emails[0],
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

const SingleEmailAdminPage = ({
  user,
  foundEmail,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateEmailMutation] = useMutation(updateEmail)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundEmail}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Email</span>)
            try {
              await updateEmailMutation({
                where: { id: foundEmail?.id },
                data: { ...values },
              })
              toast.success(() => <span>Email Updated</span>, { id: toastId })
              router.push(Routes.AdminEmail())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundEmail?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="subject" label="subject" disabled />
          <LabeledTextField name="cc" label="cc" disabled />
          <LabeledTextField name="body" label="body" disabled />
          <LabeledTextField name="templateUsed" label="templateUsed" disabled />
          <LabeledTextField name="templateId" label="templateId" disabled />
          <LabeledTextField name="candidate" label="candidate" disabled />
          <LabeledTextField name="candidateId" label="candidateId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
          <LabeledTextField name="sender" label="sender" disabled />
          <LabeledTextField name="senderId" label="senderId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleEmailAdminPage
