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
import getJobs from "app/admin/queries/admin/getJobs"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import { plans } from "app/core/utils/plans"
import { RadioGroupField } from "app/core/components/RadioGroupField"
import toast from "react-hot-toast"
import updateJob from "app/admin/mutations/admin/updateJob"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    const foundJob = await invokeWithMiddleware(
      getJobs,
      {
        where: { id: context?.params?.id as string },
      },
      { ...context }
    )

    return {
      props: {
        foundJob: foundJob.jobs[0],
        user: user,
        plans: plans,
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

const SingleJobAdminPage = ({
  user,
  foundJob,
  plans,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateJobMutation] = useMutation(updateJob)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundJob}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Job</span>)
            try {
              await updateJobMutation({
                where: { id: foundJob?.id },
                data: { ...values },
                initial: foundJob!,
              })
              toast.success(() => <span>Job Updated</span>, { id: toastId })
              router.push(Routes.AdminJob())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={`${foundJob?.name}`}
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

export default SingleJobAdminPage
