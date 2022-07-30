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

import getInterviews from "app/admin/queries/admin/getInterviews"
import updateInterview from "app/admin/mutations/admin/updateInterview"

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
    const foundInterview = await invokeWithMiddleware(
      getInterviews,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundInterview: foundInterview.interviews[0],
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

const SingleInterviewAdminPage = ({
  user,
  foundInterview,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateInterviewMutation] = useMutation(updateInterview)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundInterview}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Interview</span>)
            try {
              await updateInterviewMutation({
                where: { id: foundInterview?.id },
                data: { ...values },
              })
              toast.success(() => <span>Interview Updated</span>, { id: toastId })
              router.push(Routes.AdminInterview())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundInterview?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="candidate" label="candidate" disabled />
          <LabeledTextField name="candidateId" label="candidateId" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
          <LabeledTextField name="organizer" label="organizer" disabled />
          <LabeledTextField name="organizerId" label="organizerId" disabled />
          <LabeledTextField name="interviewer" label="interviewer" disabled />
          <LabeledTextField name="interviewerId" label="interviewerId" disabled />
          <LabeledTextField name="otherAttendees" label="otherAttendees" disabled />
          <LabeledTextField name="startDateUTC" label="startDateUTC" disabled />
          <LabeledTextField name="duration" label="duration" disabled />
          <LabeledTextField name="calendarId" label="calendarId" disabled />
          <LabeledTextField name="eventId" label="eventId" disabled />
          <LabeledTextField name="calendarLink" label="calendarLink" disabled />
          <LabeledTextField name="meetingLink" label="meetingLink" disabled />
          <LabeledTextField name="cancelCode" label="cancelCode" disabled />
          <LabeledTextField name="cancelled" label="cancelled" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleInterviewAdminPage
