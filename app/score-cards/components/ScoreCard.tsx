import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { CardQuestionInputType } from "app/card-questions/validations"
import CheckboxField from "app/core/components/CheckboxField"
import { useEffect, useMemo, useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import { useMutation, useQuery } from "blitz"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "app/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import { z } from "zod"
import getScoreCardQuestionsWOPagination from "app/score-cards/queries/getScoreCardQuestionsWOPagination"
import { ExtendedScoreCardQuestion, ExtendedCardQuestion } from "types"
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/outline"
import getScoreCard from "../queries/getScoreCard"
import { Candidate } from "@prisma/client"

type ScoreCardProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  submitDisabled?: boolean
  header: string
  subHeader: string
  scoreCardId: string
  preview: boolean
  scoreCardQuestions?: ExtendedScoreCardQuestion[]
  onChange?: any
  userId: number
  candidate?: Candidate
  workflowStageId?: string
}

export const ScoreCard = (props: ScoreCardProps) => {
  const [defaultScoreCard] = useQuery(getScoreCard, {
    where: { userId: props.userId, name: "Default" },
  })

  const [queryScoreCardQuestions] = useQuery(getScoreCardQuestionsWOPagination, {
    where: { scoreCardId: props.scoreCardId || defaultScoreCard?.id },
  })

  const [data, setData] = useState<ExtendedScoreCardQuestion[]>([])

  const scoreCardQuestions = (props.scoreCardQuestions ||
    queryScoreCardQuestions.sort((a, b) => {
      return a?.order - b?.order
    })) as any as ExtendedScoreCardQuestion[]

  useMemo(async () => {
    let data: ExtendedScoreCardQuestion[] = []

    await scoreCardQuestions.forEach((sq) => {
      data = [...data, { ...sq }]
      setData(data)
    })
  }, [scoreCardQuestions])

  const getZodType = (sq: ExtendedScoreCardQuestion, zodType) => {
    return sq.behaviour === "REQUIRED"
      ? zodType.nonempty
        ? zodType.nonempty({ message: "Required" })
        : zodType
      : zodType.optional()
  }

  const getValidationObj = (sq: ExtendedScoreCardQuestion) => {
    const q = sq.cardQuestion
    return {
      [q.name]: getZodType(sq, z.number()),
      [`${q.name} Note`]: z.string().optional(),
      [`${q.name} ScoreId`]: z.string().optional(),
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
        submitDisabled={props.submitDisabled}
        isSubmitTop={true}
        schema={zodObj}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="applicationScoreCard"
        header={props.header}
        subHeader={props.subHeader}
      >
        {data.map((sq) => {
          if (sq.behaviour === "OFF") {
            return
          }

          const q = sq.cardQuestion

          const existingScore = sq.scores.find(
            (score) =>
              score.candidateId === props.candidate?.id &&
              score.workflowStageId ===
                (props.workflowStageId || props.candidate?.workflowStageId || "0") &&
              sq.scoreCard.jobWorkflowStages.findIndex(
                (jws) =>
                  jws.workflowStageId ===
                    (props.workflowStageId || props.candidate?.workflowStageId || "0") &&
                  jws.jobId === (props.candidate?.jobId || "0")
              ) >= 0
          )
          console.log(existingScore)

          const disabled = props.workflowStageId !== props.candidate?.workflowStageId

          return (
            <div key={q.id}>
              {!(sq.showNote || existingScore?.note) && (
                <button
                  disabled={disabled}
                  title="Add Note"
                  onClick={() => {
                    sq.showNote = true
                    setData([...data])
                  }}
                  className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircleIcon className="h-5 w-auto text-theme-600" />
                </button>
              )}
              {!existingScore?.note && sq.showNote && (
                <button
                  disabled={disabled}
                  title="Hide Note"
                  onClick={() => {
                    sq.showNote = false
                    setData([...data])
                  }}
                  className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="h-5 w-auto text-red-600" />
                </button>
              )}

              <LabeledRatingField
                disabled={disabled}
                value={existingScore?.rating}
                name={`${q.name}`}
                label={q.name}
                onChange={props.onChange}
              />

              {(sq.showNote || existingScore?.note) && (
                <LabeledTextAreaField
                  disabled={disabled}
                  defaultValue={existingScore?.note || ""}
                  name={`${q.name} Note`}
                />
              )}

              <LabeledTextField
                type="hidden"
                name={`${q.name} ScoreId`}
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
