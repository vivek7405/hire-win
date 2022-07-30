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

import getQuestionoptions from "app/admin/queries/admin/getQuestionoptions"
import updateQuestionoption from "app/admin/mutations/admin/updateQuestionoption"

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
    const foundQuestionoption = await invokeWithMiddleware(
      getQuestionoptions,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundQuestionoption: foundQuestionoption.questionoptions[0],
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

const SingleQuestionoptionAdminPage = ({
  user,
  foundQuestionoption,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateQuestionoptionMutation] = useMutation(updateQuestionoption)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundQuestionoption}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Questionoption</span>)
            try {
              await updateQuestionoptionMutation({
                where: { id: foundQuestionoption?.id },
                data: { ...values },
              })
              toast.success(() => <span>Questionoption Updated</span>, { id: toastId })
              router.push(Routes.AdminQuestionoption())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundQuestionoption?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="text" label="text" disabled />
          <LabeledTextField name="question" label="question" disabled />
          <LabeledTextField name="questionId" label="questionId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleQuestionoptionAdminPage
