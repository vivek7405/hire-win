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

import getCalendars from "app/admin/queries/admin/getCalendars"
import updateCalendar from "app/admin/mutations/admin/updateCalendar"

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
    const foundCalendar = await invokeWithMiddleware(
      getCalendars,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundCalendar: foundCalendar.calendars[0],
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

const SingleCalendarAdminPage = ({
  user,
  foundCalendar,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCalendarMutation] = useMutation(updateCalendar)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundCalendar}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Calendar</span>)
            try {
              await updateCalendarMutation({
                where: { id: foundCalendar?.id },
                data: { ...values },
              })
              toast.success(() => <span>Calendar Updated</span>, { id: toastId })
              router.push(Routes.AdminCalendar())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundCalendar?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField name="caldavAddress" label="caldavAddress" disabled />
          <LabeledTextField name="username" label="username" disabled />
          <LabeledTextField name="encryptedPassword" label="encryptedPassword" disabled />
          <LabeledTextField name="refreshToken" label="refreshToken" disabled />
          <LabeledTextField name="type" label="type" disabled />
          <LabeledTextField name="defaultCalendars" label="defaultCalendars" disabled />
          <LabeledTextField
            name="jobUserScheduleCalendars"
            label="jobUserScheduleCalendars"
            disabled
          />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCalendarAdminPage
