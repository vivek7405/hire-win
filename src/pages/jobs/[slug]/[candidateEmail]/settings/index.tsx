import { gSSP } from "src/blitz-server"
import { getSession } from "@blitzjs/auth"
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

import ApplicationForm from "src/candidates/components/ApplicationForm"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import updateCandidate from "src/candidates/mutations/updateCandidate"
import getCandidate from "src/candidates/queries/getCandidate"
import { AttachmentObject, ExtendedAnswer } from "types"
import getCandidateInitialValues from "src/candidates/utils/getCandidateInitialValues"
import getJob from "src/jobs/queries/getJob"
import { AuthorizationError } from "blitz"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  const job = await getJob(
    {
      where: {
        companyId: session.companyId || "0",
        slug: context?.params?.slug as string,
      },
    },
    { ...context.ctx }
  )
  const { can: canUpdate } = await Guard.can(
    "update",
    "candidate",
    { ...context.ctx },
    {
      where: {
        jobId_email: {
          jobId: job?.id,
          email: context?.params?.candidateEmail as string,
        },
      },
    }
  )

  if (user) {
    try {
      if (canUpdate) {
        const candidate = await getCandidate(
          {
            where: { email: context?.params?.candidateEmail as string },
          },
          { ...context.ctx }
        )

        return {
          props: {
            user: user,
            candidate: candidate,
            canUpdate,
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
        destination: `/auth/login?next=/jobs/${context?.params?.slug}/candidates/${context?.params?.id}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
})

const CandidateSettingsPage = ({
  user,
  candidate,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateCandidateMutation] = useMutation(updateCandidate)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }
  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Candidates", href: "/candidates" }]} />
      <br />
      <ApplicationForm
        jobId={candidate?.job?.id || "0"}
        preview={false}
        header="Candidate Details"
        subHeader="Update candidate details"
        initialValues={getCandidateInitialValues(candidate as any)}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Candidate</span>)
          try {
            await updateCandidateMutation({
              where: { id: candidate?.id },
              // initial: candidate as any,
              data: {
                id: candidate?.id,
                jobId: candidate?.job?.id,
                name: values.Name,
                email: values.Email,
                resume: values.Resume,
                source: candidate?.source,
                answers:
                  candidate?.job?.formQuestions?.map((formQuestion) => {
                    const val = values[formQuestion?.title] || ""
                    return {
                      formQuestionId: formQuestion.id,
                      value: typeof val === "string" ? val : JSON.stringify(val),
                    }
                  }) || ([] as any),
                visibleOnlyToParentMembers: values.visibleOnlyToParentMembers,
              },
            })
            toast.success(() => <span>Candidate Updated</span>, { id: toastId })
            router.push(Routes.SingleJobPage({ slug: candidate?.job?.slug! }))
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />
    </AuthLayout>
  )
}

export default CandidateSettingsPage
