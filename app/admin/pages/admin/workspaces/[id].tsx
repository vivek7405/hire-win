import React from "react"
import {
  useMutation,
  Routes,
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useRouter,
} from "blitz"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getWorkspaces from "app/admin/queries/admin/getWorkspaces"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { RadioGroupField } from "app/core/components/RadioGroupField"
import toast from "react-hot-toast"
import updateWorkspace from "app/admin/mutations/admin/updateWorkspace"
import allPlans from "app/plans/utils/allPlans"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const foundWorkspace = await invokeWithMiddleware(
      getWorkspaces,
      {
        where: { id: context?.params?.id as string },
      },
      { ...context }
    )

    return {
      props: {
        foundWorkspace: foundWorkspace.workspaces[0],
        user: user,
        plans: allPlans,
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

const SingleWorkspaceAdminPage = ({
  user,
  foundWorkspace,
  plans,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateWorkspaceMutation] = useMutation(updateWorkspace)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundWorkspace}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Workspace</span>)
            try {
              await updateWorkspaceMutation({
                where: { id: foundWorkspace?.id },
                data: { ...values },
                initial: foundWorkspace!,
              })
              toast.success(() => <span>Workspace Updated</span>, { id: toastId })
              router.push(Routes.AdminWorkspace())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={`${foundWorkspace?.name}`}
          subHeader={``}
        >
          <LabeledTextField name="id" label="Id" disabled />

          <LabeledTextField name="createdAt" label="Created At" disabled />

          <LabeledTextField name="modifiedAt" label="Modified At" disabled />

          <LabeledTextField name="name" label="Name" />

          <LabeledTextField name="slug" label="Slug" disabled />

          <LabeledTextField name="stripeCustomerId" label="Stripe Customer Id" disabled />

          <LabeledTextField name="stripeSubscriptionId" label="Stripe Subscription Id" disabled />

          <LabeledTextField
            name="stripeCurrentPeriodEnd"
            label="Stripe Current Period End Date"
            disabled
          />

          <RadioGroupField
            label="Select a plan"
            name="stripePriceId"
            options={Object.entries(plans!).map((plan) => plan[1].priceId)}
          />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleWorkspaceAdminPage
