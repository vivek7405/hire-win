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
import ApplicationForm from "app/candidates/components/ApplicationForm"
import createCandidate from "app/candidates/mutations/createCandidate"
import { CandidateSource } from "@prisma/client"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const job = await invokeWithMiddleware(
    getJob,
    {
      where: { slug: context?.params?.slug as string },
    },
    { ...context }
  )

  if (!job) {
    return {
      props: {
        error: {
          statusCode: 404,
          message: "Job not found",
        },
      },
    }
  }

  const { can: canCreate } = await Guard.can("create", "candidate", { session }, { jobId: job?.id })

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "job",
    { session },
    { where: { slug: context?.params?.slug as string } }
  )

  if (user) {
    try {
      if (canCreate) {
        return {
          props: {
            user: user,
            job: job,
            canCreate,
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

const NewCandidate = ({
  user,
  job,
  isOwner,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createCandidateMutation] = useMutation(createCandidate)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="New Job" user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
      <div className="mt-6">
        <ApplicationForm
          header="Job Application Form"
          subHeader={`Apply to the job - ${job?.title}`}
          formId={job?.formId || ""}
          preview={false}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Candidate</span>)
            try {
              await createCandidateMutation({
                jobId: job?.id,
                name: values.Name,
                email: values.Email,
                resume: values.Resume,
                source: CandidateSource.Manual,
                answers:
                  job?.form?.questions?.map((fq) => {
                    const val = values[fq.question?.name] || ""
                    return {
                      questionId: fq.questionId,
                      value: typeof val === "string" ? val : JSON.stringify(val),
                    }
                  }) || [],
              })
              toast.success(() => <span>Candidate created</span>, { id: toastId })
              router.push(Routes.SingleJobPage({ slug: job?.slug! }))
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                { id: toastId }
              )
            }
          }}
        />
      </div>
    </AuthLayout>
  )
}

export default NewCandidate
