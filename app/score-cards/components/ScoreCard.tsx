import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { CardQuestionInputType } from "app/card-questions/validations"
import CheckboxField from "app/core/components/CheckboxField"
import { useEffect, useState } from "react"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import DynamicTextFields from "app/core/components/DynamicTextFields"
import { useQuery } from "blitz"
import SingleFileUploadField from "app/core/components/SingleFileUploadField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledPhoneNumberField from "app/core/components/LabeledPhoneNumberField"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import { z } from "zod"
import getScoreCardQuestionsWOPagination from "app/score-cards/queries/getScoreCardQuestionsWOPagination"
import { ExtendedScoreCardQuestion, ExtendedCardQuestion } from "types"

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
}

export const ScoreCard = (props: ScoreCardProps) => {
  const [queryScoreCardQuestions] = useQuery(getScoreCardQuestionsWOPagination, {
    where: { scoreCardId: props.scoreCardId },
  })

  const scoreCardQuestions = props.scoreCardQuestions || queryScoreCardQuestions

  const getZodType = (sq: ExtendedScoreCardQuestion, zodType) => {
    return sq.behaviour === "REQUIRED"
      ? zodType.nonempty
        ? zodType.nonempty({ message: "Required" })
        : zodType
      : zodType.optional()
  }

  const getValidationObj = (sq: ExtendedScoreCardQuestion) => {
    const q = sq.cardQuestion
    return { [q.name]: getZodType(sq, z.number()) }
  }

  let validationObj = {}
  scoreCardQuestions.forEach((fq) => {
    validationObj = { ...validationObj, ...getValidationObj(fq as any) }
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
        {scoreCardQuestions.map((sq) => {
          const q = sq.cardQuestion
          if (sq.behaviour === "OFF") {
            return
          }
          return (
            <LabeledRatingField key={q.id} name={q.name} label={q.name} onChange={props.onChange} />
          )
        })}
      </Form>
    </>
  )
}

export default ScoreCard
