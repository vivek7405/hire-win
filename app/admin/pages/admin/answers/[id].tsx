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

import getAnswers from "app/admin/queries/admin/getAnswers"
import updateAnswer from "app/admin/mutations/admin/updateAnswer"

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
    const foundAnswer = await invokeWithMiddleware(
      getAnswers,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundAnswer: foundAnswer.answers[0],
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

const SingleAnswerAdminPage = ({
  user,
  foundAnswer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateAnswerMutation] = useMutation(updateAnswer)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundAnswer}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Answer</span>)
            try {
              await updateAnswerMutation({
                where: { id: foundAnswer?.id },
                data: { ...values },
              })
              toast.success(() => <span>Answer Updated</span>, { id: toastId })
              router.push(Routes.AdminAnswer())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundAnswer?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="value" label="value" disabled />
          <LabeledTextField name="question" label="question" disabled />
          <LabeledTextField name="questionId" label="questionId" disabled />
          <LabeledTextField name="candidate" label="candidate" disabled />
          <LabeledTextField name="candidateId" label="candidateId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleAnswerAdminPage
