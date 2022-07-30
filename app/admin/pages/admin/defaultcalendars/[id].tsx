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

import getDefaultcalendars from "app/admin/queries/admin/getDefaultcalendars"
import updateDefaultcalendar from "app/admin/mutations/admin/updateDefaultcalendar"

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
    const foundDefaultcalendar = await invokeWithMiddleware(
      getDefaultcalendars,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundDefaultcalendar: foundDefaultcalendar.defaultcalendars[0],
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

const SingleDefaultcalendarAdminPage = ({
  user,
  foundDefaultcalendar,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateDefaultcalendarMutation] = useMutation(updateDefaultcalendar)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundDefaultcalendar}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Defaultcalendar</span>)
            try {
              await updateDefaultcalendarMutation({
                where: { id: foundDefaultcalendar?.id },
                data: { ...values },
              })
              toast.success(() => <span>Defaultcalendar Updated</span>, { id: toastId })
              router.push(Routes.AdminDefaultcalendar())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundDefaultcalendar?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField name="calendar" label="calendar" disabled />
          <LabeledTextField name="calendarId" label="calendarId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleDefaultcalendarAdminPage
