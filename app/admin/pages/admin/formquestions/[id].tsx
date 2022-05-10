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

import getFormquestions from "app/admin/queries/admin/getFormquestions"
import updateFormquestion from "app/admin/mutations/admin/updateFormquestion"

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
    const foundFormquestion = await invokeWithMiddleware(
      getFormquestions,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundFormquestion: foundFormquestion.formquestions[0],
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

const SingleFormquestionAdminPage = ({
  user,
  foundFormquestion,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateFormquestionMutation] = useMutation(updateFormquestion)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundFormquestion}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Formquestion</span>)
            try {
              await updateFormquestionMutation({
                where: { id: foundFormquestion?.id },
                data: { ...values },
              })
              toast.success(() => <span>Formquestion Updated</span>, { id: toastId })
              router.push(Routes.AdminFormquestion())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundFormquestion?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="order" label="order" disabled />
          <LabeledTextField name="behaviour" label="behaviour" disabled />
          <LabeledTextField name="allowBehaviourEdit" label="allowBehaviourEdit" disabled />
          <LabeledTextField name="form" label="form" disabled />
          <LabeledTextField name="formId" label="formId" disabled />
          <LabeledTextField name="question" label="question" disabled />
          <LabeledTextField name="questionId" label="questionId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleFormquestionAdminPage
