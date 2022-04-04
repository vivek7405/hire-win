import { LabeledTextField } from "app/core/components/LabeledTextField"
import { LabeledTextAreaField } from "app/core/components/LabeledTextAreaField"
import { Form } from "app/core/components/Form"
import { CardQuestionInputType } from "app/card-questions/validations"
import CheckboxField from "app/core/components/CheckboxField"
import { useEffect, useMemo, useState } from "react"
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
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/outline"

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

  const [data, setData] = useState<ExtendedScoreCardQuestion[]>([])

  const scoreCardQuestions = (props.scoreCardQuestions ||
    queryScoreCardQuestions) as any as ExtendedScoreCardQuestion[]

  useMemo(async () => {
    let data: ExtendedScoreCardQuestion[] = []

    await scoreCardQuestions
      ?.sort((a, b) => {
        return a?.order - b?.order
      })
      .forEach((sq) => {
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
    return { [q.name]: getZodType(sq, z.number()), [`${q.name} Note`]: z.string().optional() }
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
          const q = sq.cardQuestion
          if (sq.behaviour === "OFF") {
            return
          }
          return (
            <div key={q.id}>
              {!sq.showNote && (
                <span title="Add Note">
                  <PlusCircleIcon
                    className="h-5 w-auto float-right cursor-pointer"
                    onClick={() => {
                      sq.showNote = true
                      setData([...data])
                    }}
                  />
                </span>
              )}
              {sq.showNote && (
                <span title="Hide Note">
                  <XCircleIcon
                    className="h-5 w-auto float-right cursor-pointer"
                    onClick={() => {
                      sq.showNote = false
                      setData([...data])
                    }}
                  />
                </span>
              )}
              <LabeledRatingField name={q.name} label={q.name} onChange={props.onChange} />
              {sq.showNote && <LabeledTextAreaField name={`${q.name} Note`} />}
            </div>
          )
        })}
      </Form>
    </>
  )
}

export default ScoreCard
