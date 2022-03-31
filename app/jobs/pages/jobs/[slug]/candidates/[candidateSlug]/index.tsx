import React, { Suspense, useEffect, useMemo, useState } from "react"
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  invokeWithMiddleware,
  Link,
  Routes,
  AuthorizationError,
  ErrorComponent,
  getSession,
  useRouter,
  usePaginatedQuery,
  dynamic,
} from "blitz"
import path from "path"
import Guard from "app/guard/ability"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import AuthLayout from "app/core/layouts/AuthLayout"
import Breadcrumbs from "app/core/components/Breadcrumbs"

import getCandidate from "app/jobs/queries/getCandidate"
import {
  AttachmentObject,
  CardType,
  DragDirection,
  ExtendedAnswer,
  ExtendedCandidate,
  ExtendedFormQuestion,
} from "types"
import axios from "axios"
import PDFViewer from "app/core/components/PDFViewer"
import { QuestionType } from "@prisma/client"
import Cards from "app/core/components/Cards"
import Skeleton from "react-loading-skeleton"

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

  if (user) {
    try {
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
          canUpdate: canUpdate,
          candidate: candidate,
        },
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
        destination: `/login?next=jobs/${context?.params?.slug}/candidates/${context?.params?.candidateSlug}`,
        permanent: false,
      },
      props: {},
    }
  }
}

// const parseResume = async (resume) => {
//   if (resume) {
//     const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/resume/parse`
//     const config = {
//       headers: {
//         "content-type": "application/json",
//       },
//     }
//     await axios
//       .post(url, resume, config)
//       .then((response) => {
//         console.log(response?.data)
//       })
//       .catch((error) => {
//         console.log(error)
//       })
//   }
// }

const getResume = async (resume) => {
  if (resume) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/getFile`
    const config = {
      headers: {
        "content-type": "application/json",
      },
    }
    const response = await axios.post(url, resume, config)
    return response
  }
}

const getAnswer = (formQuestion: ExtendedFormQuestion, candidate: ExtendedCandidate) => {
  const answer: ExtendedAnswer = candidate?.answers?.find(
    (ans) => ans.question?.name === formQuestion?.question?.name
  )!

  if (answer) {
    const val = answer.value
    const type = answer?.question?.type

    switch (type) {
      case QuestionType.URL:
        return (
          <a
            href={val}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {val}
          </a>
        )
      case QuestionType.Multiple_select:
        const answerSelectedOptionIds: String[] = JSON.parse(val)
        const selectedOptions = answer?.question?.options
          ?.filter((op) => answerSelectedOptionIds?.includes(op.id))
          ?.map((op) => {
            return op.text
          })
        return JSON.stringify(selectedOptions)
      case QuestionType.Single_select:
        return answer?.question?.options?.find((op) => val === op.id)?.text
      case QuestionType.Attachment:
        const attachmentObj: AttachmentObject = JSON.parse(val)
        return (
          <a
            href={attachmentObj.Location}
            className="text-theme-600 hover:text-theme-500"
            target="_blank"
            rel="noreferrer"
          >
            {attachmentObj.Key}
          </a>
        )
      case QuestionType.Long_text:
        return <p className="max-w-md overflow-auto">{val}</p>
      default:
        return val
    }
  }

  return ""
}

const getCards = (candidate: ExtendedCandidate) => {
  return (
    candidate?.job?.form?.questions
      ?.sort((a, b) => {
        return (a?.order || 0) - (b?.order || 0)
      })
      // ?.filter((q) => !q.question.factory)
      ?.map((fq) => {
        const answer = getAnswer(fq, candidate)
        return {
          id: fq.id,
          title: fq.question.name,
          description: answer,
          // renderContent: (
          //   <>
          //     <div className="w-full flex flex-col space-y-2">
          //       <div className="w-full relative">
          //         <div className="font-semibold flex justify-between">
          //           {!fq.question.factory ? (
          //             <Link href={Routes.SingleQuestionPage({ slug: fq.question.slug })} passHref>
          //               <a
          //                 data-testid={`questionlink`}
          //                 className="text-theme-600 hover:text-theme-900"
          //               >
          //                 {fq.question.name}
          //               </a>
          //             </Link>
          //           ) : (
          //             fq.question.name
          //           )}
          //         </div>
          //       </div>

          //       {/* <div className="border-b-2 border-neutral-50" />
          //       <div className="text-sm text-neutral-500 font-semibold">
          //         {fq.question?.type?.toString().replaceAll("_", " ")}
          //       </div> */}

          //       {answer && <div className="border-b-2 border-neutral-50" />}
          //       {answer && (
          //         <div className="text-lg font-bold">
          //           {answer}
          //         </div>
          //       )}
          //     </div>
          //   </>
          // ),
        }
      }) as CardType[]
  )
}

const SingleCandidatePage = ({
  user,
  candidate,
  error,
  canUpdate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [file, setFile] = useState(null as any)
  const [cards, setCards] = useState(getCards(candidate!))
  useEffect(() => {
    setCards(getCards(candidate!))
  }, [candidate])

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  const resume = candidate?.resume as AttachmentObject
  if (!file) {
    getResume(resume).then((response) => {
      const file = response?.data?.Body
      setFile(file)
    })
  }

  // try {
  //   parseResume(resume)
  // } catch (error) {
  //   console.log(error)
  // }

  return (
    <AuthLayout user={user}>
      <Breadcrumbs ignore={[{ href: "/candidates", breadcrumb: "Candidates" }]} />

      <br />

      <Link href={Routes.JobsHome()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          Add Score
        </a>
      </Link>
      {canUpdate && (
        <Link
          href={Routes.CandidateSettingsPage({
            slug: candidate?.job?.slug!,
            candidateSlug: candidate?.slug!,
          })}
          passHref
        >
          <a
            className="float-right underline text-theme-600 mr-8 py-2 hover:text-theme-800"
            data-testid={`${candidate?.id}-settingsLink`}
          >
            Settings
          </a>
        </Link>
      )}

      <h3 className="font-bold text-5xl">{candidate?.name}</h3>

      <br />

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <div className="flex flex-col md:flex-row lg:flex-row space-y-2 md:space-y-0 lg:space-y-0 md:space-x-2 lg:space-x-2">
          <div className="w-full md:w-1/2 lg:w-1/2 p-2 flex flex-col space-y-1 border-2 border-neutral-400 rounded-lg">
            {file && <PDFViewer file={file} />}
            <Cards
              cards={cards}
              setCards={setCards}
              noPagination={true}
              mutateCardDropDB={(source, destination, draggableId) => {}}
              droppableName="answers"
              isDragDisabled={true}
              direction={DragDirection.HORIZONTAL}
              noSearch={true}
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/2 p-2 border-2 border-neutral-400 rounded-lg">
            <Cards
              cards={cards}
              setCards={setCards}
              noPagination={true}
              mutateCardDropDB={(source, destination, draggableId) => {}}
              droppableName="comments"
              isDragDisabled={true}
              direction={DragDirection.HORIZONTAL}
              noSearch={true}
            />
          </div>
        </div>
      </Suspense>
    </AuthLayout>
  )
}

export default SingleCandidatePage
