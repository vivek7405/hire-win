import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useRouter } from "next/router"
import { getSession, useSession } from "@blitzjs/auth"
import { Routes, ErrorComponent } from "@blitzjs/next"

import { usePaginatedQuery, useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"

import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import path from "path"
import Guard from "src/guard/ability"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import AuthLayout from "src/core/layouts/AuthLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"

import Modal from "src/core/components/Modal"
import Table from "src/core/components/Table"
// import AddExistingCardQuestionsForm from "src/score-cards/components/AddExistingCardQuestionsForm"
import toast from "react-hot-toast"

import {
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
  TrashIcon,
  XIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline"
import { CardType, DragDirection, ExtendedScoreCardQuestion, ShiftDirection } from "types"
import shiftScoreCardQuestion from "src/score-cards/mutations/shiftScoreCardQuestion"
import Confirm from "src/core/components/Confirm"
import removeCardQuestionFromScoreCard from "src/score-cards/mutations/removeCardQuestionFromScoreCard"
import ScoreCard from "src/score-cards/components/ScoreCard"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import Form from "src/core/components/Form"
import updateScoreCardQuestionBehaviour from "src/score-cards/mutations/updateScoreCardQuestionBehaviour"
// import getScoreCardQuestions from "src/score-cards/queries/getScoreCardQuestions"
import CardQuestionForm from "src/score-cards/components/ScoreCardQuestionForm"
import addNewCardQuestionToScoreCard from "src/score-cards/mutations/addNewCardQuestionToScoreCard"
import Cards from "src/core/components/Cards"
import Debouncer from "src/core/utils/debouncer"
import { ScoreCardQuestion, Behaviour, JobUserRole } from "@prisma/client"
import updateScoreCardQuestionName from "src/score-cards/mutations/updateScoreCardQuestionName"
import getScoreCardQuestions from "src/score-cards/queries/getScoreCardQuestions"
import JobSettingsLayout from "src/core/layouts/JobSettingsLayout"
import getJob from "src/jobs/queries/getJob"
import getStage from "src/stages/queries/getStage"
import { AuthorizationError } from "blitz"
import { PencilIcon } from "@heroicons/react/solid"
import getJobUser from "src/jobs/queries/getJobUser"
import StageSettingsLayout from "src/core/layouts/StageSettingsLayout"
import StageForm from "src/stages/components/StageForm"
import updateStage from "src/stages/mutations/updateStage"
import getJobStages from "src/stages/queries/getJobStages"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  //   const { can: canUpdate } = await Guard.can(
  //     "update",
  //     "scoreCard",
  //     { session },
  //     {
  //       where: {
  //         slug: context?.params?.slug!,
  //         companyId: session?.companyId || "0",
  //       },
  //     }
  //   )

  const job = await getJob(
    {
      where: {
        slug: (context?.params?.slug as string) || "0",
        companyId: session?.companyId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && job) {
    try {
      const jobUser = await getJobUser(
        {
          where: {
            jobId: job?.id || "0",
            userId: user?.id || "0",
          },
        },
        context.ctx
      )
      let canAccess = true
      if (jobUser?.role === JobUserRole.USER) {
        canAccess = false
      }

      if (canAccess) {
        const stage = await getStage(
          { where: { slug: (context?.params?.stageSlug as string) || "0", jobId: job.id } },
          { ...context.ctx }
        )
        return {
          props: {
            user: user,
            job,
            stage: stage || null,
            //   canUpdate: canUpdate,
            //   scoreCard: scoreCard,
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
        destination: `/auth/login?next=/scoreCards/${context?.params?.slug}`,
        permanent: false,
      },
      props: {},
    }
  }
})

const StageSettingsPage = ({
  user,
  job,
  stage,
  //   scoreCard,
  error,
}: //   canUpdate,
InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [openAddExistingCardQuestions, setOpenAddExistingCardQuestions] = React.useState(false)
  const [openAddNewCardQuestion, setOpenAddNewCardQuestion] = React.useState(false)
  // const [openPreviewScoreCard, setOpenPreviewScoreCard] = React.useState(false)
  const [addNewCardQuestionToScoreCardMutation] = useMutation(addNewCardQuestionToScoreCard)
  const [scoreCardQuestionToEdit, setScoreCardQuestionToEdit] = useState(
    null as ScoreCardQuestion | null
  )
  const [updateScoreCardQuestionNameMutation] = useMutation(updateScoreCardQuestionName)
  const router = useRouter()
  const session = useSession()
  const [updateStageMutation] = useMutation(updateStage)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="Hire.win | Score Card" user={user}>
      <Suspense fallback="Loading...">
        <JobSettingsLayout job={job!}>
          <StageSettingsLayout jobSlug={job?.slug} stageSlug={stage?.slug}>
            {/* <div className="mt-6 md:p-0 md:mt-0 flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
              <div className="sm:mr-5">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Score Card Config</h2>
                <h4 className="text-xs sm:text-sm text-gray-700">
                  The questions configured here shall appear on the score card
                </h4>
                <h4 className="text-xs sm:text-sm text-gray-700">For stage {stage?.name}</h4>
              </div>
              <Modal
                header="Add New Question"
                open={openAddNewCardQuestion}
                setOpen={setOpenAddNewCardQuestion}
              >
                <CardQuestionForm
                  editmode={scoreCardQuestionToEdit ? true : false}
                  header={`${scoreCardQuestionToEdit ? "Update" : "Add New"} Question`}
                  subHeader="Enter Question details"
                  initialValues={
                    scoreCardQuestionToEdit ? { title: scoreCardQuestionToEdit?.title } : {}
                  }
                  onSubmit={async (values) => {
                    const isEdit = scoreCardQuestionToEdit ? true : false

                    const toastId = toast.loading(
                      isEdit ? "Updating Question" : "Adding New Question"
                    )
                    try {
                      isEdit
                        ? await updateScoreCardQuestionNameMutation({
                            where: { id: scoreCardQuestionToEdit?.id },
                            data: { ...values },
                            initial: scoreCardQuestionToEdit!,
                          })
                        : await addNewCardQuestionToScoreCardMutation({
                            stageId: stage?.id || "0",
                            ...values,
                          })
                      invalidateQuery(getScoreCardQuestions)
                      invalidateQuery(getStage)
                      toast.success(
                        isEdit ? "Question updated successfully" : "Question added successfully",
                        {
                          id: toastId,
                        }
                      )
                      setScoreCardQuestionToEdit(null)
                      setOpenAddNewCardQuestion(false)
                    } catch (error) {
                      toast.error(
                        `Failed to ${isEdit ? "update" : "add new"} template - ${error.toString()}`,
                        { id: toastId }
                      )
                    }
                  }}
                  // onSubmit={async (values) => {
                  //   const toastId = toast.loading(() => <span>Adding Question</span>)
                  //   try {
                  //     await addNewCardQuestionToScoreCardMutation({
                  //       ...values,
                  //       scoreCardId: scoreCard?.id as string,
                  //     })
                  //     toast.success(() => <span>Question added</span>, {
                  //       id: toastId,
                  //     })
                  //     router.reload()
                  //   } catch (error) {
                  //     toast.error(
                  //       "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                  //     )
                  //   }
                  // }}
                />
              </Modal>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setScoreCardQuestionToEdit(null)
                  setOpenAddNewCardQuestion(true)
                }}
                data-testid={`open-addStage-modal`}
                className="float-right text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
              >
                Add New Question
              </button>
            </div> */}

            <div className="w-full flex items-center justify-center">
              <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
                <Suspense fallback={<p className="pt-3">Loading...</p>}>
                  <StageForm
                    jobId={job?.id}
                    header="Stage Settings"
                    subHeader={`For stage ${stage?.name}`}
                    onSubmit={async (values) => {
                      const toastId = toast.loading("Updating Stage Settings")
                      try {
                        await updateStageMutation({
                          where: { id: stage?.id },
                          data: { ...values },
                          initial: stage,
                        })
                        await invalidateQuery(getJobStages)
                        toast.success("Stage settings updated successfully", {
                          id: toastId,
                        })
                      } catch (error) {
                        toast.error(`Failed to update stage settings - ${error.toString()}`, {
                          id: toastId,
                        })
                      }
                    }}
                    initialValues={{
                      name: stage?.name || "",
                      interviewerId: stage?.interviewer?.id,
                      duration: stage?.duration?.toString(),
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </StageSettingsLayout>
        </JobSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

export default StageSettingsPage
