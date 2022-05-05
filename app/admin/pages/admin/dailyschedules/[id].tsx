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

import getDailyschedules from "app/admin/queries/admin/getDailyschedules"
import updateDailyschedule from "app/admin/mutations/admin/updateDailySchedule"

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
    const foundDailyschedule = await invokeWithMiddleware(
      getDailyschedules,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundDailyschedule: foundDailyschedule.dailyschedules[0],
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

const SingleDailyscheduleAdminPage = ({
  user,
  foundDailyschedule,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateDailyscheduleMutation] = useMutation(updateDailyschedule)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundDailyschedule}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Dailyschedule</span>)
            try {
              await updateDailyscheduleMutation({
                where: { id: foundDailyschedule?.id },
                data: { ...values },
              })
              toast.success(() => <span>Dailyschedule Updated</span>, { id: toastId })
              router.push(Routes.AdminDailyschedule())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundDailyschedule?.id?.toString()}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="day" label="day" disabled />
          <LabeledTextField name="startTime" label="startTime" disabled />
          <LabeledTextField name="endTime" label="endTime" disabled />
          <LabeledTextField name="schedule" label="schedule" disabled />
          <LabeledTextField name="scheduleId" label="scheduleId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleDailyscheduleAdminPage
