import { gSSP } from "src/blitz-server"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@blitzjs/auth"
import { usePaginatedQuery, useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes, ErrorComponent } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useEffect, useState, useMemo, Suspense } from "react"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "src/jobs/queries/getJobs"
import Table from "src/core/components/Table"

import getUser from "src/users/queries/getUser"
import SingleFileUploadField from "src/core/components/SingleFileUploadField"
import { AttachmentObject, ExtendedJob, ExtendedUser, SubscriptionStatus } from "types"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import { Form } from "src/core/components/Form"
import getJob from "src/jobs/queries/getJob"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import ApplicationForm from "src/candidates/components/ApplicationForm"
import createCandidate from "src/candidates/mutations/createCandidate"
import { CandidateSource } from "@prisma/client"
import toast from "react-hot-toast"
import JobApplicationLayout from "src/core/layouts/JobApplicationLayout"
import { checkPlan } from "src/companies/utils/checkPlan"
import getCompany from "src/companies/queries/getCompany"
import Guard from "src/guard/ability"
import { checkSubscription } from "src/companies/utils/checkSubscription"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const session = await getSession(context.req, context.res)

  const company = await getCompany(
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context.ctx }
  )

  if (company) {
    // const currentPlan = checkPlan(company)

    const job = await getJob(
      {
        where: { slug: context?.params?.jobSlug as string, companyId: company?.id || "0" },
      },
      { ...context.ctx }
    )

    if (job) {
      const { can: canAccess } = await Guard.can(
        "access",
        "jobListing",
        { ...context.ctx },
        { jobId: job?.id }
      )

      if (canAccess) {
        return {
          props: {
            company,
            job,
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
    } else {
      return {
        redirect: {
          destination: "/auth/login",
          permanent: false,
        },
        props: {},
      }
    }
  } else {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
      props: {},
    }
  }
})

const ApplyToJob = ({
  company,
  job,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createCandidateMutation] = useMutation(createCandidate)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  // Post job to Google if on paid plan
  return (
    <JobApplicationLayout
      job={job}
      company={company}
      // addGoogleJobPostingScript={!!checkSubscription(company) && (job?.postToGoogle || false)}
      addGoogleJobPostingScript={job?.postToGoogle || false}
    >
      <Suspense fallback="Loading...">
        {!(
          !job?.description ||
          job?.description?.trim() === "" ||
          job?.description?.trim() === "<p><br></p>"
        ) && (
          <>
            <button
              type="button"
              className="w-full text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
              onClick={() => {
                router.push(
                  Routes.JobDescriptionPage({
                    companySlug: company?.slug || "",
                    jobSlug: job?.slug!,
                  })
                )
              }}
            >
              View Job Description
            </button>

            <br />
            <br />
          </>
        )}

        <ApplicationForm
          header="Application Form"
          subHeader={`Apply to the job - ${job?.title}`}
          jobId={job?.id || "0"}
          preview={false}
          careersPage={true}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Applying to job</span>)
            try {
              await createCandidateMutation({
                jobId: job?.id,
                name: values.Name,
                email: values.Email,
                resume: values.Resume,
                source: CandidateSource.Careers_Page,
                answers:
                  job?.formQuestions?.map((formQuestion) => {
                    const val = values[formQuestion?.title] || ""
                    return {
                      formQuestionId: formQuestion.id,
                      value: typeof val === "string" ? val : JSON.stringify(val),
                    }
                  }) || [],
              })
              toast.success(() => <span>Applied successfully</span>, { id: toastId })
              router.push(Routes.CareersPage({ companySlug: company?.slug || "" }))
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
