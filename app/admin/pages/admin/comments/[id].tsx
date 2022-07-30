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

import getComments from "app/admin/queries/admin/getComments"
import updateComment from "app/admin/mutations/admin/updateComment"

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
    const foundComment = await invokeWithMiddleware(
      getComments,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundComment: foundComment.comments[0],
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

const SingleCommentAdminPage = ({
  user,
  foundComment,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCommentMutation] = useMutation(updateComment)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundComment}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Comment</span>)
            try {
              await updateCommentMutation({
                where: { id: foundComment?.id },
                data: { ...values },
              })
              toast.success(() => <span>Comment Updated</span>, { id: toastId })
              router.push(Routes.AdminComment())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundComment?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="text" label="text" disabled />
          <LabeledTextField name="creator" label="creator" disabled />
          <LabeledTextField name="creatorId" label="creatorId" disabled />
          <LabeledTextField name="candidate" label="candidate" disabled />
          <LabeledTextField name="candidateId" label="candidateId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
          <LabeledTextField name="parentComment" label="parentComment" disabled />
          <LabeledTextField name="parentCommentId" label="parentCommentId" disabled />
          <LabeledTextField name="childComments" label="childComments" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCommentAdminPage
