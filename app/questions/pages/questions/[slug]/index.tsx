import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Link,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useRouter,
  useMutation,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getQuestion from "app/questions/queries/getQuestion"
import QuestionForm from "app/questions/components/QuestionForm"
import toast from "react-hot-toast"
import updateQuestion from "app/questions/mutations/updateQuestion"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const { can: canUpdate } = await Guard.can(
    "update",
    "question",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      const question = await invokeWithMiddleware(
        getQuestion,
        { where: { slug: context?.params?.slug!, companyId: session?.companyId } },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          question: question,
        },
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/login?next=/questions/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleQuestionPage = ({
  user,
  question,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateQuestionMutation] = useMutation(updateQuestion)
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <QuestionForm
        header="Question Details"
        subHeader="Update the question details"
        initialValues={{
          name: question?.name,
          type: question?.type,
          placeholder: question?.placeholder,
          acceptedFiles: question?.acceptedFiles,
          options: question?.options?.map((op) => {
            return { id: op.id, text: op.text }
          }),
        }}
        editmode={true}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Question</span>)
          try {
            await updateQuestionMutation({
              where: { slug: question?.slug },
              data: { ...values },
              initial: question!,
            })
            toast.success(() => <span>Question Updated</span>, { id: toastId })
            router.push(Routes.QuestionsHome())
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />
    </AuthLayout>
  )
}

export default SingleQuestionPage
