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
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import path from "path"

import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import toast from "react-hot-toast"
import Guard from "app/guard/ability"

import JobForm from "app/jobs/components/JobForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateJob from "app/jobs/mutations/updateJob"
import { checkPlan } from "app/users/utils/checkPlan"
import getJob from "app/jobs/queries/getJob"
import JobSettingsLayout from "app/core/layouts/JobSettingsLayout"

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

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      if (canUpdate) {
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
            job: job,
            canUpdate,
            isOwner,
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
        destination: `/login?next=/jobs/${context?.params?.slug}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const JobSettingsPage = ({
  user,
  job,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateJobMutation] = useMutation(updateJob)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <JobSettingsLayout job={job!} isOwner={isOwner}>
        <JobForm
          user={user}
          category={job?.category!}
          workflow={job?.workflow!}
          form={job?.form!}
          jobId={job?.id}
          header="Job Details"
          subHeader="Update job details"
          initialValues={{
            title: job?.title,
            country: job?.country,
            state: job?.state,
            city: job?.city,
            remote: job?.remote,
            currency: job?.currency,
            minSalary: job?.minSalary,
            maxSalary: job?.maxSalary,
            salaryType: job?.salaryType,
            employmentType: job?.employmentType,
            validThrough: job?.validThrough,
            description: job?.description
              ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
              : EditorState.createEmpty(),
            categoryId: job?.category?.id,
            workflowId: job?.workflow?.id,
            formId: job?.form?.id,
            scoreCards: job?.scoreCards,
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating Job</span>)
            try {
              values.description = convertToRaw(values?.description?.getCurrentContent() || {})

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
        />
      </JobSettingsLayout>
    </AuthLayout>
  )
}

export default JobSettingsPage
