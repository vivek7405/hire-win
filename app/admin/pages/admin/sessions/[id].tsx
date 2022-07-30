import React from "react"
import { InferGetServerSidePropsType, GetServerSidePropsContext, invokeWithMiddleware } from "blitz"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getSessions from "app/admin/queries/admin/getSessions"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const foundSession = await invokeWithMiddleware(
      getSessions,
      {
        where: { id: parseInt(context?.params?.id as string) },
      },
      { ...context }
    )

    return {
      props: {
        foundSession: foundSession.sessions[0],
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

const SingleSessionAdminPage = ({
  user,
  foundSession,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundSession}
          onSubmit={async (values) => {
            console.log(values)
          }}
          header={`${foundSession?.id}`}
          subHeader={``}
        >
          <LabeledTextField name="id" label="Id" disabled />

          <LabeledTextField name="createdAt" label="Created At" disabled />

          <LabeledTextField name="expiresAt" label="Expires At" disabled />

          <LabeledTextField name="userId" label="User Id" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleSessionAdminPage
