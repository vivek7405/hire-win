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

import ApplicationForm from "app/candidates/components/ApplicationForm"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import updateCandidate from "app/candidates/mutations/updateCandidate"
import getCandidate from "app/candidates/queries/getCandidate"
import { AttachmentObject, ExtendedAnswer } from "types"
import { QuestionType } from "@prisma/client"
import getCandidateInitialValues from "app/candidates/utils/getCandidateInitialValues"

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
    "candidate",
    { session },
    { where: { slug: context?.params?.candidateSlug as string } }
  )

  const { can: isOwner } = await Guard.can(
    "isOwner",
    "candidate",
    { session },
    { where: { slug: context?.params?.candidateSlug as string } }
  )

  if (user) {
    try {
      if (canUpdate) {
        const candidate = await invokeWithMiddleware(
          getCandidate,
          {
            where: { slug: context?.params?.candidateSlug as string },
          },
          { ...context }
        )

        return {
          props: {
            user: user,
            candidate: candidate,
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
        destination: `/login?next=/jobs/${context?.params?.slug}/candidates/${context?.params?.id}/settings`,
        permanent: false,
      },
      props: {},
    }
  }
}

const CandidateSettingsPage = ({
  user,
  candidate,
  isOwner,
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
        formId={candidate?.job?.formId!}
        preview={false}
        header="Candidate Details"
        subHeader="Update candidate details"
        initialValues={getCandidateInitialValues(candidate as any)}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Candidate</span>)
          try {
            await updateCandidateMutation({
              where: { id: candidate?.id },
              initial: candidate as any,
              data: {
                id: candidate?.id,
                jobId: candidate?.job?.id,
                name: values.Name,
                email: values.Email,
                resume: values.Resume,
                source: candidate?.source,
                answers:
                  candidate?.job?.form?.questions?.map((fq) => {
                    const val = values[fq.question?.name] || ""
                    return {
                      questionId: fq.questionId,
                      value: typeof val === "string" ? val : JSON.stringify(val),
                    }
                  }) || ([] as any),
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
