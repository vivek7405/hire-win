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

import getBookings from "app/admin/queries/admin/getBookings"
import updateBooking from "app/admin/mutations/admin/updateBooking"

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
    const foundBooking = await invokeWithMiddleware(
      getBookings,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundBooking: foundBooking.bookings[0],
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

const SingleBookingAdminPage = ({
  user,
  foundBooking,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateBookingMutation] = useMutation(updateBooking)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundBooking}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Booking</span>)
            try {
              await updateBookingMutation({
                where: { id: foundBooking?.id },
                data: { ...values },
              })
              toast.success(() => <span>Booking Updated</span>, { id: toastId })
              router.push(Routes.AdminBooking())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundBooking?.id?.toString()}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="interviewDetail" label="interviewDetail" disabled />
          <LabeledTextField name="interviewDetailId" label="interviewDetailId" disabled />
          <LabeledTextField name="inviteeEmail" label="inviteeEmail" disabled />
          <LabeledTextField name="startDateUTC" label="startDateUTC" disabled />
          <LabeledTextField name="cancelCode" label="cancelCode" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleBookingAdminPage
