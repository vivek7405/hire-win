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

import getJobusers from "app/admin/queries/admin/getJobusers"
import updateJobuser from "app/admin/mutations/admin/updateJobuser"

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
    const foundJobuser = await invokeWithMiddleware(
      getJobusers,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundJobuser: foundJobuser.jobusers[0],
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

const SingleJobuserAdminPage = ({
  user,
  foundJobuser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateJobuserMutation] = useMutation(updateJobuser)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundJobuser}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Jobuser</span>)
            try {
              await updateJobuserMutation({
                where: { id: foundJobuser?.id },
                data: { ...values },
              })
              toast.success(() => <span>Jobuser Updated</span>, { id: toastId })
              router.push(Routes.AdminJobuser())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundJobuser?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="role" label="role" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleJobuserAdminPage
