import { gSSP } from "src/blitz-server"
import { getSession, useSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React, { Suspense } from "react"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import path from "path"

import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "src/guard/ability"
import updateJob from "src/jobs/mutations/updateJob"
import getJob from "src/jobs/queries/getJob"
import moment from "moment"
import JobForm from "src/jobs/components/JobForm"
import { AuthorizationError } from "blitz"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import updateJobDescription from "src/jobs/mutations/updateJobDescription"
import JobDescriptionForm from "src/jobs/components/JobDescriptionForm"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"

export const getServerSideProps = gSSP(async (context) => {
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
    { ...context.ctx },
    {
      where: {
        companyId_slug: {
          companyId: session.companyId || "0",
          slug: context?.params?.slug as string,
        },
      },
    }
  )

  // const { can: isOwner } = await Guard.can(
  //   "isOwner",
  //   "job",
  //   { session },
  //   { where: { slug: context?.params?.slug as string } }
  // )

  if (user) {
    try {
      if (canUpdate) {
        const job = await getJob(
          {
            where: {
              slug: (context?.params?.slug as string) || "0",
              companyId: session.companyId || "0",
            },
          },
          { ...context.ctx }
        )

        const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

        return {
          props: {
            user: user,
            job: job,
            canUpdate,
            activePlanName,
          } as any,
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
        destination: `/auth/login?next=/jobs/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
})

const JobDescriptionSettingsPage = ({
  user,
  job,
  activePlanName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const [updateJobDescriptionMutation] = useMutation(updateJobDescription)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Job Settings" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <JobDescriptionForm
            companyId={session.companyId || "0"}
            user={user}
            activePlanName={activePlanName}
            jobId={job?.id}
            header="Job Description"
            subHeader="Add a Job Description so that it appears in Job Listing"
            initialValues={{ description: job?.description }}
            onSubmit={async (values) => {
              const toastId = toast.loading(() => <span>Updating Job Description</span>)
              try {
                await updateJobDescriptionMutation({
                  where: { id: job?.id },
                  data: { ...values },
                })
                toast.success(() => <span>Job Description Updated</span>, { id: toastId })
              } catch (error) {
                toast.error(
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                )
              }
            }}
          />
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobDescriptionSettingsPage
