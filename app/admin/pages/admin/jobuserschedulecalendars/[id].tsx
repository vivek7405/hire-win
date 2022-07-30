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

import getJobuserschedulecalendars from "app/admin/queries/admin/getJobuserschedulecalendars"
import updateJobuserschedulecalendar from "app/admin/mutations/admin/updateJobuserschedulecalendar"

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
    const foundJobuserschedulecalendar = await invokeWithMiddleware(
      getJobuserschedulecalendars,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundJobuserschedulecalendar: foundJobuserschedulecalendar.jobuserschedulecalendars[0],
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

const SingleJobuserschedulecalendarAdminPage = ({
  user,
  foundJobuserschedulecalendar,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateJobuserschedulecalendarMutation] = useMutation(updateJobuserschedulecalendar)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundJobuserschedulecalendar}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Jobuserschedulecalendar</span>)
            try {
              await updateJobuserschedulecalendarMutation({
                where: { id: foundJobuserschedulecalendar?.id },
                data: { ...values },
              })
              toast.success(() => <span>Jobuserschedulecalendar Updated</span>, { id: toastId })
              router.push(Routes.AdminJobuserschedulecalendar())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundJobuserschedulecalendar?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="schedule" label="schedule" disabled />
          <LabeledTextField name="scheduleId" label="scheduleId" disabled />
          <LabeledTextField name="calendar" label="calendar" disabled />
          <LabeledTextField name="calendarId" label="calendarId" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleJobuserschedulecalendarAdminPage
