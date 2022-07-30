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

import getJobs from "app/admin/queries/admin/getJobs"
import updateJob from "app/admin/mutations/admin/updateJob"

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
    const foundJob = await invokeWithMiddleware(
      getJobs,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundJob: foundJob.jobs[0],
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
              })
              toast.success(() => <span>Job Updated</span>, { id: toastId })
              router.push(Routes.AdminJob())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundJob?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="createdBy" label="createdBy" disabled />
          <LabeledTextField name="createdById" label="createdById" disabled />
          <LabeledTextField name="title" label="title" disabled />
          <LabeledTextField name="slug" label="slug" disabled />
          <LabeledTextField name="country" label="country" disabled />
          <LabeledTextField name="state" label="state" disabled />
          <LabeledTextField name="city" label="city" disabled />
          <LabeledTextField name="remote" label="remote" disabled />
          <LabeledTextField name="hidden" label="hidden" disabled />
          <LabeledTextField name="showSalary" label="showSalary" disabled />
          <LabeledTextField name="currency" label="currency" disabled />
          <LabeledTextField name="minSalary" label="minSalary" disabled />
          <LabeledTextField name="maxSalary" label="maxSalary" disabled />
          <LabeledTextField name="salaryType" label="salaryType" disabled />
          <LabeledTextField name="employmentType" label="employmentType" disabled />
          <LabeledTextField name="validThrough" label="validThrough" disabled />
          <LabeledTextField name="description" label="description" disabled />
          <LabeledTextField name="tokens" label="tokens" disabled />
          <LabeledTextField name="users" label="users" disabled />
          <LabeledTextField name="category" label="category" disabled />
          <LabeledTextField name="categoryId" label="categoryId" disabled />
          <LabeledTextField name="workflow" label="workflow" disabled />
          <LabeledTextField name="workflowId" label="workflowId" disabled />
          <LabeledTextField name="form" label="form" disabled />
          <LabeledTextField name="formId" label="formId" disabled />
          <LabeledTextField name="scoreCards" label="scoreCards" disabled />
          <LabeledTextField name="interviews" label="interviews" disabled />
          <LabeledTextField name="interviewDetails" label="interviewDetails" disabled />
          <LabeledTextField
            name="jobUserScheduleCalendars"
            label="jobUserScheduleCalendars"
            disabled
          />
          <LabeledTextField name="candidates" label="candidates" disabled />
          <LabeledTextField name="archived" label="archived" disabled />
          <LabeledTextField name="company" label="company" disabled />
          <LabeledTextField name="companyId" label="companyId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleJobAdminPage
