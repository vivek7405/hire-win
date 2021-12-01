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

import getJob from "app/jobs/queries/getJob"

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
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      const job = await invokeWithMiddleware(
        getJob,
        {
          where: { slug: context?.params?.slug as string },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          job: job,
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
        destination: `/login?next=/jobs/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleJobPage = ({
  user,
  job,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />

      {canUpdate && (
        <Link href={Routes.JobSettingsPage({ slug: job?.slug as string })} passHref>
          <a data-testid={`${job?.name && `${job?.name}-`}settingsLink`}>Settings</a>
        </Link>
      )}
    </AuthLayout>
  )
}

export default SingleJobPage
