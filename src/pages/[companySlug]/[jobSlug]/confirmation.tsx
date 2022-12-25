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

const JobConfirmationPage = ({
  company,
  job,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  const [theme, setTheme] = useState(company?.theme || "indigo")
  useEffect(() => {
    const themeName = company?.theme || "indigo"
    setTheme(themeName)
  }, [setTheme, company?.theme])

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <JobApplicationLayout company={company!} job={job!}>
      <div className="w-full h-auto">
        <div className={`w-full h-full flex items-center justify-center theme-${theme}`}>
          <div className="w-96 p-6 h-fit bg-white rounded-lg border border-black-600 flex flex-col space-y-7 items-center justify-center">
            <p className="text-lg font-bold">We received your application!</p>
            <p className="text-center">
              You shall hear back from our team soon if your application is considered.
            </p>
          </div>
        </div>
      </div>
    </JobApplicationLayout>
  )
}

export default JobConfirmationPage
