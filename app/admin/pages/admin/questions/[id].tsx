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

import getQuestions from "app/admin/queries/admin/getQuestions"
import updateQuestion from "app/admin/mutations/admin/updateQuestion"

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
    const foundQuestion = await invokeWithMiddleware(
      getQuestions,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundQuestion: foundQuestion.questions[0],
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

const SingleQuestionAdminPage = ({
  user,
  foundQuestion,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateQuestionMutation] = useMutation(updateQuestion)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundQuestion}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Question</span>)
            try {
              await updateQuestionMutation({
                where: { id: foundQuestion?.id },
                data: { ...values },
              })
              toast.success(() => <span>Question Updated</span>, { id: toastId })
              router.push(Routes.AdminQuestion())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundQuestion?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="placeholder" label="placeholder" disabled />
          <LabeledTextField name="type" label="type" disabled />
          <LabeledTextField name="options" label="options" disabled />
          <LabeledTextField name="acceptedFiles" label="acceptedFiles" disabled />
          <LabeledTextField name="factory" label="factory" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField name="forms" label="forms" disabled />
          <LabeledTextField name="answers" label="answers" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleQuestionAdminPage
