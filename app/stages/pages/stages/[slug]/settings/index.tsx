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
} from "blitz"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "app/guard/ability"

import StageForm from "app/stages/components/StageForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateStage from "app/stages/mutations/updateStage"
import getStage from "app/stages/queries/getStage"

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
    "stage",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const stage = await invokeWithMiddleware(
          getStage,
          { where: { slug: context?.params?.slug!, userId: user?.id } },
          { ...context }
        )

        return {
          props: {
            user: user,
            stage: stage,
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
        destination: `/login?next=/stages/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const StageSettingsPage = ({
  user,
  stage,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateStageMutation] = useMutation(updateStage)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <StageForm
        header="Stage Details"
        subHeader="Update your stage details."
        initialValues={{
          name: stage?.name,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Stage</span>)
          try {
            await updateStageMutation({
              where: { slug: stage?.slug },
              data: { ...values },
              initial: stage!,
            })
            toast.success(() => <span>Stage Updated</span>, { id: toastId })
            router.push(Routes.StagesHome())
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

export default StageSettingsPage
