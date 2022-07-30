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

import getSchedules from "app/admin/queries/admin/getSchedules"
import updateSchedule from "app/admin/mutations/admin/updateSchedule"

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
    const foundSchedule = await invokeWithMiddleware(
      getSchedules,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundSchedule: foundSchedule.schedules[0],
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

const SingleScheduleAdminPage = ({
  user,
  foundSchedule,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateScheduleMutation] = useMutation(updateSchedule)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundSchedule}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Schedule</span>)
            try {
              await updateScheduleMutation({
                where: { id: foundSchedule?.id },
                data: { ...values },
              })
              toast.success(() => <span>Schedule Updated</span>, { id: toastId })
              router.push(Routes.AdminSchedule())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundSchedule?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="timezone" label="timezone" disabled />
          <LabeledTextField name="dailySchedules" label="dailySchedules" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField
            name="jobUserScheduleCalendars"
            label="jobUserScheduleCalendars"
            disabled
          />
          <LabeledTextField name="factory" label="factory" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleScheduleAdminPage
