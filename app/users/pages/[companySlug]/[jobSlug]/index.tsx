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
  const avatar: AttachmentObject = JSON.parse(JSON.stringify(user?.avatar)) || {
    Location: "",
    Key: "",
  }
  const router = useRouter()

  return (
    <AuthLayout title={`Job Description | ${user?.slug}`} user={user} hideNavbar={true}>
      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <div className="flex justify-center items-center">
          <img
            src={avatar?.Location}
            alt={`${user?.company} logo`}
            width={200}
            className="self-center"
          />
        </div>
        <br />
        <Form
          initialValues={{
            description: job?.description
              ? EditorState.createWithContent(convertFromRaw(job?.description || {}))
              : EditorState.createEmpty(),
          }}
          onSubmit={async (values) => {}}
        >
          <LabeledRichTextField
            name="description"
            // label="Description"
            // placeholder="Description"
            testid="jobDescription"
            toolbarHidden={true}
            readOnly={true}
          />
        </Form>
        <button
          type="button"
          className="mt-7 w-full text-white bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => {
            router.push(Routes.ApplyToJob({ companySlug: user?.slug!, jobSlug: job?.slug! }))
          }}
        >
          Apply to Job
        </button>
      </Suspense>
    </AuthLayout>
  )
}

export default JobDescriptionPage
