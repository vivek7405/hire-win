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
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

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
      const stage = await invokeWithMiddleware(
        getStage,
        { slug: context?.params?.slug! },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          stage: stage,
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
        destination: `/login?next=/stages/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleStagePage = ({
  user,
  stage,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs />
      <br />
      {canUpdate && (
        <Link href={Routes.StageSettingsPage({ slug: stage?.slug! })} passHref>
          <a data-testid={`${stage?.name && `${stage?.name}-`}settingsLink`}>Settings</a>
        </Link>
      )}
    </AuthLayout>
  )
}

export default SingleStagePage
