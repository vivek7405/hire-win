import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import getCardQuestionsWOPagination from "app/card-questions/queries/getCardQuestionsWOPagination"
import { useQuery } from "blitz"
import getScoreCardQuestionsWOPaginationWOAbility from "../queries/getScoreCardQuestionsWOPaginationWOAbility"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"

type AddExistingCardQuestionsFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  user: any
  schema: any
  scoreCardId: string
  companyId: string
}

export const AddExistingCardQuestionsForm = (props: AddExistingCardQuestionsFormProps) => {
  const [scoreCardQuestions] = useQuery(getScoreCardQuestionsWOPaginationWOAbility, {
    where: { scoreCardId: props.scoreCardId },
  })
  const [cardQuestions] = useQuery(getCardQuestionsWOPagination, {
    where: {
      companyId: props.companyId,
      slug: {
        notIn: scoreCardQuestions.map((ws) => {
          return ws.cardQuestion.slug
        }),
      },
    },
  })
  return (
    <>
      <Form
        header="Add Questions"
        subHeader="Add existing questions to the scoreCard"
        submitText="Add"
        submitDisabled={cardQuestions?.length ? false : true}
        schema={props.schema}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addCardQuestionScoreCard"
      >
        <LabeledReactSelectField
          name="cardQuestionIds"
          label="CardQuestions"
          placeholder="Select Questions"
          testid="scoreCardQuestions"
          isMulti={true}
          options={
            cardQuestions?.length
              ? [
                  ...cardQuestions.map((c) => {
                    return { label: c.name, value: c.id }
                  }),
                ]
              : [{ label: "No more questions to add", value: "" }]
          }
        />
      </Form>
    </>
  )
}

export default AddExistingCardQuestionsForm
