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

import getInterviewdetails from "app/admin/queries/admin/getInterviewdetails"
import updateInterviewdetail from "app/admin/mutations/admin/updateInterviewdetail"

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
    const foundInterviewdetail = await invokeWithMiddleware(
      getInterviewdetails,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundInterviewdetail: foundInterviewdetail.interviewdetails[0],
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

const SingleInterviewdetailAdminPage = ({
  user,
  foundInterviewdetail,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateInterviewdetailMutation] = useMutation(updateInterviewdetail)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundInterviewdetail}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Interviewdetail</span>)
            try {
              await updateInterviewdetailMutation({
                where: { id: foundInterviewdetail?.id },
                data: { ...values },
              })
              toast.success(() => <span>Interviewdetail Updated</span>, { id: toastId })
              router.push(Routes.AdminInterviewdetail())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundInterviewdetail?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="interviewer" label="interviewer" disabled />
          <LabeledTextField name="interviewerId" label="interviewerId" disabled />
          <LabeledTextField name="duration" label="duration" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleInterviewdetailAdminPage
