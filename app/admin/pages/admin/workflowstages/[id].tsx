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

import getWorkflowstages from "app/admin/queries/admin/getWorkflowstages"
import updateWorkflowstage from "app/admin/mutations/admin/updateWorkflowstage"

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
    const foundWorkflowstage = await invokeWithMiddleware(
      getWorkflowstages,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundWorkflowstage: foundWorkflowstage.workflowstages[0],
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

const SingleWorkflowstageAdminPage = ({
  user,
  foundWorkflowstage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateWorkflowstageMutation] = useMutation(updateWorkflowstage)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundWorkflowstage}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Workflowstage</span>)
            try {
              await updateWorkflowstageMutation({
                where: { id: foundWorkflowstage?.id },
                data: { ...values },
              })
              toast.success(() => <span>Workflowstage Updated</span>, { id: toastId })
              router.push(Routes.AdminWorkflowstage())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundWorkflowstage?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="order" label="order" disabled />
          <LabeledTextField name="workflow" label="workflow" disabled />
          <LabeledTextField name="workflowId" label="workflowId" disabled />
          <LabeledTextField name="stage" label="stage" disabled />
          <LabeledTextField name="stageId" label="stageId" disabled />
          <LabeledTextField name="scoreCards" label="scoreCards" disabled />
          <LabeledTextField name="scores" label="scores" disabled />
          <LabeledTextField name="interviewers" label="interviewers" disabled />
          <LabeledTextField name="interviews" label="interviews" disabled />
          <LabeledTextField name="interviewDetails" label="interviewDetails" disabled />
          <LabeledTextField
            name="jobUserScheduleCalendars"
            label="jobUserScheduleCalendars"
            disabled
          />
          <LabeledTextField name="candidates" label="candidates" disabled />
          <LabeledTextField name="comments" label="comments" disabled />
          <LabeledTextField name="emails" label="emails" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleWorkflowstageAdminPage
