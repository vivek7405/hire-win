import { useEffect, useState, useMemo, Suspense } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  Routes,
  Link,
  useRouter,
  usePaginatedQuery,
  invokeWithMiddleware,
  Image,
  useMutation,
  Head,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
import getUser from "app/users/queries/getUser"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { AttachmentObject, ExtendedJob, ExtendedUser } from "types"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { Form } from "app/core/components/Form"
import getJob from "app/jobs/queries/getJob"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import ApplicationForm from "app/jobs/components/ApplicationForm"
import createCandidate from "app/jobs/mutations/createCandidate"
import { CandidateSource } from "@prisma/client"
import toast from "react-hot-toast"
import JobApplicationLayout from "app/core/layouts/JobApplicationLayout"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await invokeWithMiddleware(
    getUser,
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context }
  )

  if (user) {
    const job = await invokeWithMiddleware(
      getJob,
      {
        where: { slug: context?.params?.jobSlug as string },
      },
      { ...context }
    )

    if (job) {
      return {
        props: {
          user: user,
          job: job,
        },
      }
    } else {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
        props: {},
      }
    }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const ApplyToJob = ({ user, job }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createCandidateMutation] = useMutation(createCandidate)

  return (
    <JobApplicationLayout user={user} job={job} addGoogleJobPostingScript={true}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <button
          type="button"
          className="w-full text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
          onClick={() => {
            router.push(
              Routes.JobDescriptionPage({ companySlug: user?.slug!, jobSlug: job?.slug! })
            )
          }}
        >
          View Job Description
        </button>

        <br />
        <br />

        <ApplicationForm
          header="Job Application Form"
          subHeader={`Apply to the job - ${job?.title}`}
          formId={job?.formId || ""}
          preview={false}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Applying to job</span>)
            try {
              await createCandidateMutation({
                jobId: job?.id,
                name: values.Name,
                email: values.Email,
                resume: values.Resume,
                source: CandidateSource.Job_Board,
                answers:
                  job?.form?.questions?.map((fq) => {
                    const val = values[fq.question?.name] || ""
                    return {
                      questionId: fq.questionId,
                      value: typeof val === "string" ? val : JSON.stringify(val),
                    }
                  }) || [],
              })
              toast.success(() => <span>Applied successfully</span>, { id: toastId })
              router.push(Routes.JobBoard({ companySlug: user?.slug! }))
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                { id: toastId }
              )
            }
          }}
        />
      </Suspense>
    </JobApplicationLayout>
  )
}

export default ApplyToJob
