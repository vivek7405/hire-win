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

import getCandidates from "app/admin/queries/admin/getCandidates"
import updateCandidate from "app/admin/mutations/admin/updateCandidate"

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
    const foundCandidate = await invokeWithMiddleware(
      getCandidates,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundCandidate: foundCandidate.candidates[0],
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

const SingleCandidateAdminPage = ({
  user,
  foundCandidate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCandidateMutation] = useMutation(updateCandidate)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundCandidate}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Candidate</span>)
            try {
              await updateCandidateMutation({
                where: { id: foundCandidate?.id },
                data: { ...values },
              })
              toast.success(() => <span>Candidate Updated</span>, { id: toastId })
              router.push(Routes.AdminCandidate())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundCandidate?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="createdBy" label="createdBy" disabled />
          <LabeledTextField name="createdById" label="createdById" disabled />
          <LabeledTextField name="name" label="name" disabled />
          <LabeledTextField name="email" label="email" disabled />
          <LabeledTextField name="resume" label="resume" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
          <LabeledTextField name="answers" label="answers" disabled />
          <LabeledTextField name="scores" label="scores" disabled />
          <LabeledTextField name="source" label="source" disabled />
          <LabeledTextField name="job" label="job" disabled />
          <LabeledTextField name="jobId" label="jobId" disabled />
          <LabeledTextField name="interviewers" label="interviewers" disabled />
          <LabeledTextField name="interviews" label="interviews" disabled />
          <LabeledTextField name="comments" label="comments" disabled />
          <LabeledTextField name="emails" label="emails" disabled />
          <LabeledTextField name="candidatePools" label="candidatePools" disabled />
          <LabeledTextField name="rejected" label="rejected" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCandidateAdminPage
