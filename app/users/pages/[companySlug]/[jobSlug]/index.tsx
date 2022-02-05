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
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import getJobs from "app/jobs/queries/getJobs"
import Table from "app/core/components/Table"
import Skeleton from "react-loading-skeleton"
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

const JobDescriptionPage = ({
  user,
  job,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  return (
    <JobApplicationLayout user={user!} job={job!}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <button
          type="button"
          className="w-full text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
          onClick={() => {
            router.push(Routes.ApplyToJob({ companySlug: user?.slug!, jobSlug: job?.slug! }))
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
          />
        </Form>
      </Suspense>
    </JobApplicationLayout>
  )
}

export default JobDescriptionPage
