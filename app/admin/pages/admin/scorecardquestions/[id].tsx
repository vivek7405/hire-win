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

import getScorecardquestions from "app/admin/queries/admin/getScorecardquestions"
import updateScorecardquestion from "app/admin/mutations/admin/updateScorecardquestion"

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
    const foundScorecardquestion = await invokeWithMiddleware(
      getScorecardquestions,
      {
        where: { id: `${context?.params?.id}` },
      },
      { ...context }
    )

    return {
      props: {
        user: user,
        foundScorecardquestion: foundScorecardquestion.scorecardquestions[0],
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

const SingleScorecardquestionAdminPage = ({
  user,
  foundScorecardquestion,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateScorecardquestionMutation] = useMutation(updateScorecardquestion)

  return (
    <AuthLayout user={user}>
      <AdminLayout>
        <Form
          submitText="Update"
          initialValues={foundScorecardquestion}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Scorecardquestion</span>)
            try {
              await updateScorecardquestionMutation({
                where: { id: foundScorecardquestion?.id },
                data: { ...values },
              })
              toast.success(() => <span>Scorecardquestion Updated</span>, { id: toastId })
              router.push(Routes.AdminScorecardquestion())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
          header={foundScorecardquestion?.id}
          subHeader={``}
        >
          <LabeledTextField name="id" label="id" disabled />
          <LabeledTextField name="createdAt" label="createdAt" disabled />
          <LabeledTextField name="updatedAt" label="updatedAt" disabled />
          <LabeledTextField name="order" label="order" disabled />
          <LabeledTextField name="behaviour" label="behaviour" disabled />
          <LabeledTextField name="allowBehaviourEdit" label="allowBehaviourEdit" disabled />
          <LabeledTextField name="scoreCard" label="scoreCard" disabled />
          <LabeledTextField name="scoreCardId" label="scoreCardId" disabled />
          <LabeledTextField name="cardQuestion" label="cardQuestion" disabled />
          <LabeledTextField name="cardQuestionId" label="cardQuestionId" disabled />
          <LabeledTextField name="scores" label="scores" disabled />
        </Form>
      </AdminLayout>
    </AuthLayout>
  )
}

export default SingleScorecardquestionAdminPage
