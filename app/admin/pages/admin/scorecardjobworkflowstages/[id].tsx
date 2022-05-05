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

import getScorecardjobworkflowstages from "app/admin/queries/admin/getScorecardjobworkflowstages"
import updateScorecardjobworkflowstage from "app/admin/mutations/admin/updateScorecardJobWorkflowStage"

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
    const foundScorecardjobworkflowstage = await invokeWithMiddleware(
      getScorecardjobworkflowstages,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundScorecardjobworkflowstage:
          foundScorecardjobworkflowstage.scorecardjobworkflowstages[0],
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

const SingleScorecardjobworkflowstageAdminPage = ({
  user,
  foundScorecardjobworkflowstage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateScorecardjobworkflowstageMutation] = useMutation(updateScorecardjobworkflowstage)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundScorecardjobworkflowstage}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Scorecardjobworkflowstage</span>)
            try {
              await updateScorecardjobworkflowstageMutation({
                where: { id: foundScorecardjobworkflowstage?.id },
                data: { ...values },
              })
              toast.success(() => <span>Scorecardjobworkflowstage Updated</span>, { id: toastId })
              router.push(Routes.AdminScorecardjobworkflowstage())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundScorecardjobworkflowstage?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="scoreCard" label="scoreCard" disabled />
          <LabeledTextField name="scoreCardId" label="scoreCardId" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleScorecardjobworkflowstageAdminPage
