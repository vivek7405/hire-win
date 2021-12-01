import React from "react"
import {
  useMutation,
  useRouter,
  Routes,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
} from "blitz"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getMemberships from "app/admin/queries/admin/getMemberships"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import toast from "react-hot-toast"
import { RadioGroupField } from "app/core/components/RadioGroupField"
import updateMembership from "app/admin/mutations/admin/updateMembership"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const foundMembership = await invokeWithMiddleware(
      getMemberships,
      {
        where: { id: parseInt(context?.params?.id as string) },
      },
      { ...context }
    )

    return {
      props: {
        foundMembership: foundMembership.memberships[0],
        user: user,
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

const SingleMembershipAdminPage = ({
  user,
  foundMembership,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateMembershipMutation] = useMutation(updateMembership)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundMembership}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Membership</span>)
            try {
              await updateMembershipMutation({
                where: { id: foundMembership?.id },
                data: { ...values },
              })
              toast.success(() => <span>Membership Updated</span>, { id: toastId })
              router.push(Routes.AdminMembership())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={`${foundMembership?.id}`}
          subHeader={``}
        >
          <LabeledTextField name="id" label="Id" disabled />

          <RadioGroupField label="Role" name="role" options={["OWNER", "USER", "ADMIN"]} />

          <LabeledTextField name="jobId" label="Job ID" disabled />

          <LabeledTextField name="userId" label="User Id" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleMembershipAdminPage
