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

import getCompanyusers from "app/admin/queries/admin/getCompanyusers"
import updateCompanyuser from "app/admin/mutations/admin/updateCompanyuser"

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
    const foundCompanyuser = await invokeWithMiddleware(
      getCompanyusers,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundCompanyuser: foundCompanyuser.companyusers[0],
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

const SingleCompanyuserAdminPage = ({
  user,
  foundCompanyuser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCompanyuserMutation] = useMutation(updateCompanyuser)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundCompanyuser}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Companyuser</span>)
            try {
              await updateCompanyuserMutation({
                where: { id: foundCompanyuser?.id },
                data: { ...values },
              })
              toast.success(() => <span>Companyuser Updated</span>, { id: toastId })
              router.push(Routes.AdminCompanyuser())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundCompanyuser?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="role" label="role" disabled />
          <LabeledTextField name="user" label="user" disabled />
          <LabeledTextField name="userId" label="userId" disabled />
          <LabeledTextField name="company" label="company" disabled />
          <LabeledTextField name="companyId" label="companyId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCompanyuserAdminPage
