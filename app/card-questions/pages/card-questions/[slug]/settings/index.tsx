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

import CardQuestionForm from "app/card-questions/components/CardQuestionForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateCardQuestion from "app/card-questions/mutations/updateCardQuestion"
import getCardQuestion from "app/card-questions/queries/getCardQuestion"

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
    "cardQuestion",
    { session },
    {
      where: {
        companyId_slug: {
          companyId: session.companyId || "0",
          slug: context?.params?.slug!,
        },
      },
    }
  )

  if (user) {
    try {
      if (canUpdate) {
        const cardQuestion = await invokeWithMiddleware(
          getCardQuestion,
          { where: { slug: context?.params?.slug!, userId: user?.id } },
          { ...context }
        )

        return {
          props: {
            user: user,
            cardQuestion: cardQuestion,
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
        destination: `/login?next=/cardQuestions/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const CardQuestionSettingsPage = ({
  user,
  cardQuestion,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [updateCardQuestionMutation] = useMutation(updateCardQuestion)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <CardQuestionForm
        header="CardQuestion Details"
        subHeader="Update the cardQuestion details"
        initialValues={{
          name: cardQuestion?.name,
        }}
        editmode={true}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating CardQuestion</span>)
          try {
            await updateCardQuestionMutation({
              where: {
                id: cardQuestion?.id,
              },
              data: { ...values },
              initial: cardQuestion!,
            })
            toast.success(() => <span>Question Updated</span>, { id: toastId })
            router.push(Routes.CardQuestionsHome())
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

export default CardQuestionSettingsPage
