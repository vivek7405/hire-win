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

import WorkflowForm from "app/workflows/components/WorkflowForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateWorkflow from "app/workflows/mutations/updateWorkflow"
import getWorkflow from "app/workflows/queries/getWorkflow"

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
    "workflow",
    { session },
    { where: { slug: context?.params?.slug! } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const workflow = await invokeWithMiddleware(
          getWorkflow,
          { where: { slug: context?.params?.slug!, companyId: session?.companyId } },
          { ...context }
        )

        return {
          props: {
            user: user,
            workflow: workflow,
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
        destination: `/login?next=/workflows/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const WorkflowSettingsPage = ({
  user,
  workflow,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [updateWorkflowMutation] = useMutation(updateWorkflow)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      <WorkflowForm
        header="Workflow Details"
        subHeader="Update workflow details"
        initialValues={{
          name: workflow?.name,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Workflow</span>)
          try {
            await updateWorkflowMutation({
              where: {
                companyId_slug: {
                  companyId: session.companyId || "0",
                  slug: workflow?.slug!,
                },
              },
              data: { ...values },
              initial: workflow!,
            })
            toast.success(() => <span>Workflow Updated</span>, { id: toastId })
            router.push(Routes.WorkflowsHome())
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

export default WorkflowSettingsPage
