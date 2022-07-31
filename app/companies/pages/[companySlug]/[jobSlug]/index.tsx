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
  getSession,
  ErrorComponent,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"

import getUser from "app/users/queries/getUser"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import { AttachmentObject } from "types"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { Form } from "app/core/components/Form"
import getJob from "app/jobs/queries/getJob"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { Country, State } from "country-state-city"
import { titleCase } from "app/core/utils/titleCase"
import JobApplicationLayout from "app/core/layouts/JobApplicationLayout"
import getCompany from "app/companies/queries/getCompany"
import Guard from "app/guard/ability"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const session = await getSession(context.req, context.res)

  const company = await invokeWithMiddleware(
    getCompany,
    {
      where: { slug: context?.params?.companySlug as string },
    },
    { ...context }
  )

  if (company) {
    const job = await invokeWithMiddleware(
      getJob,
      {
        where: { slug: context?.params?.jobSlug as string, companyId: company?.id || "0" },
      },
      { ...context }
    )

    if (job) {
      const { can: canAccess } = await Guard.can(
        "access",
        "jobListing",
        { session },
        { jobId: job?.id }
      )

      if (canAccess) {
        return {
          props: {
            company,
            job,
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
    <JobApplicationLayout company={company!} job={job!}>
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

        <Form
          initialValues={{
            description: job?.description
              ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
              : EditorState.createEmpty(),
          }}
          onSubmit={async (values) => {}}
        >
          <h3 className="text-lg font-bold">Description</h3>
          <LabeledRichTextField
            name="description"
            // label="Description"
            // placeholder="Description"
            testid="jobDescription"
            toolbarHidden={true}
            readOnly={true}
            noBorder={true}
          />
        </Form>
      </Suspense>
    </JobApplicationLayout>
  )
}

export default JobDescriptionPage
