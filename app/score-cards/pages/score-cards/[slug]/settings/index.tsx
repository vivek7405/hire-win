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

import ScoreCardForm from "app/score-cards/components/ScoreCardForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateScoreCard from "app/score-cards/mutations/updateScoreCard"
import getScoreCard from "app/score-cards/queries/getScoreCard"

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
    "scoreCard",
    { session },
    {
      where: {
        slug: context?.params?.slug!,
        companyId: session?.companyId || "0",
      },
    }
  )

  if (user) {
    try {
      if (canUpdate) {
        const scoreCard = await invokeWithMiddleware(
          getScoreCard,
          {
            where: {
              slug: context?.params?.slug!,
              companyId: session?.companyId || "0",
            },
          },
          { ...context }
        )

        return {
          props: {
            user: user,
            scoreCard: scoreCard,
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
        destination: `/login?next=/scoreCards/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const ScoreCardSettingsPage = ({
  user,
  scoreCard,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [updateScoreCardMutation] = useMutation(updateScoreCard)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <ScoreCardForm
        header="Score Card Details"
        subHeader="Update score card details"
        initialValues={{
          name: scoreCard?.name,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating ScoreCard</span>)
          try {
            await updateScoreCardMutation({
              where: {
                companyId_slug: {
                  companyId: session.companyId || "0",
                  slug: scoreCard?.slug!,
                },
              },
              data: { ...values },
              initial: scoreCard!,
            })
            toast.success(() => <span>Score Card Updated</span>, { id: toastId })
            router.push(Routes.ScoreCardsHome())
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

export default ScoreCardSettingsPage
