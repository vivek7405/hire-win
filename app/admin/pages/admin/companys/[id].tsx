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

import getCompanys from "app/admin/queries/admin/getCompanys"
import updateCompany from "app/admin/mutations/admin/updateCompany"

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
    const foundCompany = await invokeWithMiddleware(
      getCompanys,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundCompany: foundCompany.companys[0],
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

const SingleCompanyAdminPage = ({
  user,
  foundCompany,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCompanyMutation] = useMutation(updateCompany)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundCompany}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Company</span>)
            try {
              await updateCompanyMutation({
                where: { id: foundCompany?.id },
                data: { ...values },
              })
              toast.success(() => <span>Company Updated</span>, { id: toastId })
              router.push(Routes.AdminCompany())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundCompany?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="info" label="info" disabled />
          <LabeledTextField name="website" label="website" disabled />
          <LabeledTextField name="logo" label="logo" disabled />
          <LabeledTextField name="theme" label="theme" disabled />
          <LabeledTextField name="tokens" label="tokens" disabled />
          <LabeledTextField name="users" label="users" disabled />
          <LabeledTextField name="jobs" label="jobs" disabled />
          <LabeledTextField name="categories" label="categories" disabled />
          <LabeledTextField name="workflows" label="workflows" disabled />
          <LabeledTextField name="stages" label="stages" disabled />
          <LabeledTextField name="forms" label="forms" disabled />
          <LabeledTextField name="questions" label="questions" disabled />
          <LabeledTextField name="scoreCards" label="scoreCards" disabled />
          <LabeledTextField name="cardQuestions" label="cardQuestions" disabled />
          <LabeledTextField name="emailTemplates" label="emailTemplates" disabled />
          <LabeledTextField name="candidatePools" label="candidatePools" disabled />
          <LabeledTextField name="stripeCustomerId" label="stripeCustomerId" disabled />
          <LabeledTextField name="stripeSubscriptionId" label="stripeSubscriptionId" disabled />
          <LabeledTextField name="stripePriceId" label="stripePriceId" disabled />
          <LabeledTextField name="stripeCurrentPeriodEnd" label="stripeCurrentPeriodEnd" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCompanyAdminPage
