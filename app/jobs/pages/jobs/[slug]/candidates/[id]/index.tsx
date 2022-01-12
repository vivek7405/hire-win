import React, { useEffect, useMemo, useState } from "react"
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
  usePaginatedQuery,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getCandidate from "app/jobs/queries/getCandidate"
import Table from "app/core/components/Table"
import getCandidates from "app/jobs/queries/getCandidates"
import { ExtendedCandidate } from "types"

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
    "candidate",
    { session },
    { where: { id: context?.params?.id as string } }
  )

  if (user) {
    try {
      const candidate = await invokeWithMiddleware(
        getCandidate,
        {
          where: { id: context?.params?.id as string },
        },
        { ...context }
      )

      return {
        props: {
          user: user,
          canUpdate: canUpdate,
          candidate: candidate,
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
        destination: `/login?next=jobs/${context?.params?.slug}/candidates/${context?.params?.id}`,
        permanent: false,
      },
      props: {},
    }
  }
}

const SingleCandidatePage = ({
  user,
  candidate,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/candidates", breadcrumb: "Candidates" }]} />
      <br />
      {canUpdate && (
        <Link
          href={Routes.CandidateSettingsPage({ slug: candidate?.job?.slug!, id: candidate?.id! })}
          passHref
        >
          <a data-testid={`${candidate?.id}-settingsLink`}>Settings</a>
        </Link>
      )}
    </AuthLayout>
  )
}

export default SingleCandidatePage
