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
import getUsers from "app/admin/queries/admin/getUsers"
import { RadioGroupField } from "app/core/components/RadioGroupField"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import toast from "react-hot-toast"
import updateUser from "app/admin/mutations/admin/updateUser"
import LabeledTextAreaField from "app/core/components/LabeledTextAreaField"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const foundUser = await invokeWithMiddleware(
      getUsers,
      {
        where: { id: parseInt(context?.params?.id as string) },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundUser: foundUser.users[0],
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

const SingleUserAdminPage = ({
  user,
  foundUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)
  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundUser}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating User</span>)
            try {
              await updateUserMutation({
                where: { id: foundUser?.id },
                data: { ...values },
              })
              toast.success(() => <span>User Updated</span>, { id: toastId })
              router.push(Routes.AdminUser())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundUser?.email}
          subHeader={``}
        >
          <LabeledTextField name="id" label="Id" disabled />

          <LabeledTextField name="email" label="Email" disabled />

          <LabeledTextField name="companyName" label="Company Name" />

          <LabeledRichTextField
            name="companyInfo"
            label="Company Info"
            placeholder="This shall appear on Job Board"
          />

          <LabeledTextField name="createdAt" label="Created At" disabled />

          <RadioGroupField label="Role" name="role" options={["ADMIN", "USER"]} />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleUserAdminPage
