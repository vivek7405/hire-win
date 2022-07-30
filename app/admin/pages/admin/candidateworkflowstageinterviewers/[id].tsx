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

import getCandidateworkflowstageinterviewers from "app/admin/queries/admin/getCandidateworkflowstageinterviewers"
import updateCandidateworkflowstageinterviewer from "app/admin/mutations/admin/updateCandidateworkflowstageinterviewer"

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
    const foundCandidateworkflowstageinterviewer = await invokeWithMiddleware(
      getCandidateworkflowstageinterviewers,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundCandidateworkflowstageinterviewer:
          foundCandidateworkflowstageinterviewer.candidateworkflowstageinterviewers[0],
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

const SingleCandidateworkflowstageinterviewerAdminPage = ({
  user,
  foundCandidateworkflowstageinterviewer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCandidateworkflowstageinterviewerMutation] = useMutation(
    updateCandidateworkflowstageinterviewer
  )

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundCandidateworkflowstageinterviewer}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => (
              <span>Updating Candidateworkflowstageinterviewer</span>
            ))
            try {
              await updateCandidateworkflowstageinterviewerMutation({
                where: { id: foundCandidateworkflowstageinterviewer?.id },
                data: { ...values },
              })
              toast.success(() => <span>Candidateworkflowstageinterviewer Updated</span>, {
                id: toastId,
              })
              router.push(Routes.AdminCandidateworkflowstageinterviewer())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundCandidateworkflowstageinterviewer?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="candidate" label="candidate" disabled />
          <LabeledTextField name="candidateId" label="candidateId" disabled />
          <LabeledTextField name="workflowStage" label="workflowStage" disabled />
          <LabeledTextField name="workflowStageId" label="workflowStageId" disabled />
          <LabeledTextField name="interviewer" label="interviewer" disabled />
          <LabeledTextField name="interviewerId" label="interviewerId" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleCandidateworkflowstageinterviewerAdminPage
