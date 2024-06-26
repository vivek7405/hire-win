import { useMutation, useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { LabeledTextAreaField } from "src/core/components/LabeledTextAreaField"
import { Form } from "src/core/components/Form"
// import { CardQuestionInputType } from "src/card-questions/validations"
import CheckboxField from "src/core/components/CheckboxField"
import { useEffect, useMemo, useState } from "react"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import DynamicTextFields from "src/core/components/DynamicTextFields"
import SingleFileUploadField from "src/core/components/SingleFileUploadField"
import LabeledSelectField from "src/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "src/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "src/core/components/LabeledRatingField"
import { z } from "zod"
import getScoreCardQuestions from "src/score-cards/queries/getScoreCardQuestions"
import { ExtendedScoreCardQuestion, ExtendedCandidate } from "types"
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/outline"
import { Candidate, Stage, User } from "@prisma/client"
import getStage from "src/stages/queries/getStage"
import getCandidateInterviewer from "src/candidates/queries/getCandidateInterviewer"

type ScoreCardProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  // submitDisabled?: boolean
  header: string
  headerComponent?: any
  subHeader?: string
  // scoreCardId: string
  preview: boolean
  // scoreCardQuestions?: ExtendedScoreCardQuestion[]
  onChange?: any
  userId: string
  // companyId: string
  candidate?: ExtendedCandidate
  stageId?: string
}

export const ScoreCard = (props: ScoreCardProps) => {
  // const [defaultScoreCard] = useQuery(getScoreCard, {
  //   where: { companyId: props.companyId, name: "Default" },
  // })

  // const [interviewDetail] = useQuery(getCandidateInterviewDetail, {
  //   stageId: props?.stageId || "0", // selectedWorkflowStage?.id!,
  //   candidateId: props.candidate?.id || "0",
  //   jobId: props.candidate?.jobId || "0",
  // })

  const [stage] = useQuery(getStage, { where: { id: props.stageId || "0" } })

  const [interviewer] = useQuery(getCandidateInterviewer, {
    candidateId: props.candidate?.id || "0",
    stageId: props.stageId || "0",
  })

  const isScoreDisabled = interviewer?.id !== props.userId
  const disabled = !props.preview && isScoreDisabled

  // const [queryScoreCardQuestions] = useQuery(getScoreCardQuestions, {
  //   where: { stageId: props.stage || defaultScoreCard?.id },
  // })

  const [data, setData] = useState<ExtendedScoreCardQuestion[]>([])

  const scoreCardQuestions = stage?.scoreCardQuestions?.sort((a, b) => {
    return a?.order - b?.order
  }) as any as ExtendedScoreCardQuestion[]

  useMemo(async () => {
    let data: ExtendedScoreCardQuestion[] = []

    await scoreCardQuestions?.forEach((sq) => {
      data = [...data, { ...sq }]
      setData(data)
    })
  }, [scoreCardQuestions])

  const getZodType = (question: ExtendedScoreCardQuestion, zodType) => {
    return question.behaviour === "REQUIRED"
      ? zodType.nonempty
        ? zodType.nonempty({ message: "Required" })
        : zodType
      : zodType.optional()
  }

  const getValidationObj = (question: ExtendedScoreCardQuestion) => {
    return {
      [question.title]: getZodType(question, z.number()),
      [`${question.title} Note`]: z.string().optional(),
      [`${question.title} ScoreId`]: z.string().optional(),
    }
  }

  let validationObj = {}
  scoreCardQuestions.forEach((sq) => {
    validationObj = { ...validationObj, ...getValidationObj(sq as any) }
  })
  let zodObj = z.object(validationObj)

  return (
    <>
      <Form
        submitText="Submit"
        submitDisabled={disabled}
        submitHidden={props.preview}
        isSubmitTop={true}
        schema={zodObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="applicationScoreCard"
        header={props.header}
        headerComponent={props.headerComponent}
        subHeader={props.subHeader}
        key={`${props.candidate?.id}-${props.stageId}`}
      >
        {disabled && (
          <p className="text-neutral-600 text-sm italic">
            You can't edit the score since you are not assigned as the evaluator for this stage.
          </p>
        )}
        {data.map((question) => {
          if (question.behaviour === "OFF") {
            return
          }

          const existingScore = question?.scores?.find(
            (score) =>
              score.candidateId === props.candidate?.id &&
              score.stageId === (props.stageId || props.candidate?.stageId || "0")
          )

          return (
            <div key={question.id}>
              {!(question.showNote || existingScore?.note) && (
                <button
                  disabled={disabled}
                  title="Add Note"
                  onClick={() => {
                    question.showNote = true
                    setData([...data])
                  }}
                  className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircleIcon className="h-5 w-auto text-theme-600" />
                </button>
              )}
              {!existingScore?.note && question.showNote && (
                <button
                  disabled={disabled}
                  title="Hide Note"
                  onClick={() => {
                    question.showNote = false
                    setData([...data])
                  }}
                  className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="h-5 w-auto text-red-600" />
                </button>
              )}

              <LabeledRatingField
                disabled={disabled}
                defaultValue={existingScore?.rating}
                name={`${question.title}`}
                label={question.title}
                onChange={props.onChange}
              />

              {(question.showNote || existingScore?.note) && (
                <LabeledTextAreaField
                  disabled={disabled}
                  defaultValue={existingScore?.note || ""}
                  name={`${question.title} Note`}
                />
              )}

              <LabeledTextField
                type="hidden"
                name={`${question.title} ScoreId`}
                value={existingScore?.id}
              />
            </div>
          )
        })}
      </Form>
    </>
  )
}

export default ScoreCard
