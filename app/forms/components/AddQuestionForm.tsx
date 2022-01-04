import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import getQuestionsWOPagination from "app/questions/queries/getQuestionsWOPagination"
import { useQuery } from "blitz"
import getFormQuestionsWOPagination from "../queries/getFormQuestionsWOPagination"

type AddQuestionFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  user: any
  schema: any
  formId: string
}

export const AddQuestionForm = (props: AddQuestionFormProps) => {
  const [formQuestions] = useQuery(getFormQuestionsWOPagination, {
    where: { formId: props.formId },
  })
  const [questions] = useQuery(getQuestionsWOPagination, {
    where: {
      userId: props.user?.id,
      slug: {
        notIn: formQuestions.map((ws) => {
          return ws.question.slug
        }),
      },
    },
  })
  return (
    <>
      <Form
        header="Add Question"
        subHeader="Add an existing question to the form"
        submitText="Add"
        submitDisabled={questions?.length ? false : true}
        schema={props.schema}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addQuestionForm"
      >
        <LabeledSelectField
          name="questionId"
          label="Questions"
          placeholder="Form Question"
          testid="formQuestion"
          options={
            questions?.length
              ? [
                  ...questions.map((c) => {
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

export default AddQuestionForm
