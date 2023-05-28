import { gSSP } from "src/blitz-server"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@blitzjs/auth"
import { usePaginatedQuery } from "@blitzjs/rpc"
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
import { AttachmentObject } from "types"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import { Form } from "src/core/components/Form"
import getJob from "src/jobs/queries/getJob"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { Country, State } from "country-state-city"
import { titleCase } from "src/core/utils/titleCase"
import JobApplicationLayout from "src/core/layouts/JobApplicationLayout"
import getCompany from "src/companies/queries/getCompany"
import Guard from "src/guard/ability"

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
    const job = await getJob(
      {
        where: { slug: context?.params?.jobSlug as string, companyId: company?.id || "0" },
      },
      { ...context.ctx }
    )

    if (job) {
      if (
        !job?.description ||
        job?.description?.trim() === "" ||
        job?.description?.trim() === "<p><br></p>"
      ) {
        return {
          redirect: {
            destination: Routes.ApplyToJob({
              companySlug: context?.params?.companySlug as string,
              jobSlug: context?.params?.jobSlug as string,
            }),
            permanent: false,
          },
          props: {},
        }
      }

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

const JobDescriptionPage = ({
  company,
  job,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <JobApplicationLayout
      company={company!}
      job={job!}
      addGoogleJobPostingScript={job?.postToGoogle || false}
    >
      <Suspense fallback="Loading...">
        <button
          type="button"
          className="w-full text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
          onClick={() => {
            router.push(Routes.ApplyToJob({ companySlug: company?.slug!, jobSlug: job?.slug! }))
          }}
        >
          Apply to Job
        </button>

        <br />
        <br />

        <div
          className="bg-white px-7 sm:px-10 py-7 rounded-lg"
          // initialValues={{
          //   description: job?.description,
          //   // ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
          //   // : EditorState.createEmpty(),
          // }}
          // onSubmit={async (values) => {}}
        >
          <h3 className="text-xl font-bold mb-6">Job Description</h3>
          <div
            className="quill-container-output"
            dangerouslySetInnerHTML={{
              __html: job?.description || "",
            }}
          />
          {/* <LabeledRichTextField
            name="description"
            // label="Description"
            // placeholder="Description"
            testid="jobDescription"
            toolbarHidden={true}
            readOnly={true}
            noBorder={true}
          /> */}
        </div>
      </Suspense>
    </JobApplicationLayout>
  )
}

export default JobDescriptionPage
