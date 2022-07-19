import React from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  useRouter,
  Routes,
  useMutation,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useSession,
} from "blitz"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "app/guard/ability"

import QuestionForm from "app/questions/components/QuestionForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateQuestion from "app/questions/mutations/updateQuestion"
import getQuestion from "app/questions/queries/getQuestion"

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
    {
      where: {
        companyId_slug: {
          companyId: session?.companyId || "0",
          slug: context?.params?.slug!,
        },
      },
    }
  )

  if (user) {
    try {
      if (canUpdate) {
        const question = await invokeWithMiddleware(
          getQuestion,
          { where: { slug: context?.params?.slug!, companyId: session?.companyId || "0" } },
          { ...context }
        )

        return {
          props: {
            user: user,
            question: question,
            canUpdate,
          },
        }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        }
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
        destination: `/login?next=/questions/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const QuestionSettingsPage = ({
  user,
  question,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
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
              where: {
                id: question?.id,
              },
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

export default QuestionSettingsPage
