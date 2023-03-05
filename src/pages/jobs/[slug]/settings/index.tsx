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
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import moment from "moment"
import JobForm from "src/jobs/components/JobForm"
import { AuthorizationError } from "blitz"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"

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

const JobSettingsPage = ({
  user,
  job,
  activePlanName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [updateJobMutation] = useMutation(updateJob)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Job Settings" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <JobForm
            companyId={session.companyId || "0"}
            user={user}
            category={job?.category!}
            // workflow={job?.workflow!}
            // form={job?.form!}
            activePlanName={activePlanName}
            jobId={job?.id}
            header="Job Details"
            subHeader="Recommended to fill all the details"
            initialValues={{
              title: job?.title,
              country: job?.country,
              state: job?.state,
              city: job?.city,
              remoteOption: job?.remoteOption,
              postToGoogle: job?.postToGoogle,
              currency: job?.currency,
              minSalary: job?.minSalary,
              maxSalary: job?.maxSalary,
              salaryType: job?.salaryType,
              showSalary: job?.showSalary,
              jobType: job?.jobType,
              // validThrough: job?.validThrough
              //   ? moment(job?.validThrough).local().toDate()
              //   : new Date(),
              // description: job?.description
              //   ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
              //   : EditorState.createEmpty(),
              description: job?.description,
              categoryId: job?.category?.id,
              // workflowId: job?.workflow?.id,
              // formId: job?.form?.id,
              // scoreCards: job?.scoreCards,
            }}
            onSubmit={async (values) => {
              const toastId = toast.loading(() => <span>Updating Job</span>)
              try {
                // if (values?.description) {
                //   values.description = convertToRaw(values?.description?.getCurrentContent() || {})
                // }

                const updatedJob = await updateJobMutation({
                  where: { id: job?.id },
                  data: { ...values },
                  initial: job!,
                })
                toast.success(() => <span>Job Updated</span>, { id: toastId })

                if (job?.title !== updatedJob?.title) {
                  router.replace(Routes.JobSettingsPage({ slug: updatedJob?.slug || "0" }))
                }

                // router.push(Routes.JobsHome())
              } catch (error) {
                toast.error(
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                )
              }
            }}
          />
          {/* <JobFormOld
          companyId={session.companyId || "0"}
          user={user}
          category={job?.category!}
          // workflow={job?.workflow!}
          // form={job?.form!}
          jobId={job?.id}
          header="Job Details"
          subHeader="Update job details"
          initialValues={{
            title: job?.title,
            country: job?.country,
            state: job?.state,
            city: job?.city,
            remote: job?.remote,
            postToGoogle: job?.postToGoogle,
            currency: job?.currency,
            minSalary: job?.minSalary,
            maxSalary: job?.maxSalary,
            salaryType: job?.salaryType,
            showSalary: job?.showSalary,
            jobType: job?.jobType,
            validThrough: moment(job?.validThrough).local().toDate(),
            description: job?.description
              ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
              : EditorState.createEmpty(),
            categoryId: job?.category?.id,
            // workflowId: job?.workflow?.id,
            // formId: job?.form?.id,
            // scoreCards: job?.scoreCards,
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Job</span>)
            try {
              if (values?.description) {
                values.description = convertToRaw(values?.description?.getCurrentContent() || {})
              }

              await updateJobMutation({
                where: { id: job?.id },
                data: { ...values },
                initial: job!,
              })
              toast.success(() => <span>Job Updated</span>, { id: toastId })
              router.push(Routes.JobsHome())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
        /> */}
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default JobSettingsPage
