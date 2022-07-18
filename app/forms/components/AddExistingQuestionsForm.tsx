import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import getQuestionsWOPagination from "app/questions/queries/getQuestionsWOPagination"
import { useQuery, useSession } from "blitz"
import getFormQuestionsWOPagination from "../queries/getFormQuestionsWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"

type AddQuestionFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  user: any
  schema: any
  formId: string
}

export const AddExistingQuestionsForm = (props: AddQuestionFormProps) => {
  const session = useSession()
  const [formQuestions] = useQuery(getFormQuestionsWOPagination, {
    where: { formId: props.formId },
  })
  const [questions] = useQuery(getQuestionsWOPagination, {
    where: {
      companyId: session.companyId || "0",
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
        header="Add Questions"
        subHeader="Add existing questions to the form"
        submitText="Add"
        submitDisabled={questions?.length ? false : true}
        schema={props.schema}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addQuestionForm"
      >
        <LabeledReactSelectField
          name="questionIds"
          label="Questions"
          placeholder="Select Questions"
          testid="formQuestions"
          isMulti={true}
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

export default AddExistingQuestionsForm
