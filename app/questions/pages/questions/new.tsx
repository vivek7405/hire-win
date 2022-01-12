import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import QuestionForm from "app/questions/components/QuestionForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createQuestion from "app/questions/mutations/createQuestion"
import path from "path"
import { convertToRaw } from "draft-js"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
}

const NewQuestion = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createQuestionMutation] = useMutation(createQuestion)

  return (
    <AuthLayout title="New Question" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <QuestionForm
          header="Create A New Question"
          subHeader="Enter your question details"
          initialValues={{
            name: "",
          }}
          editmode={false}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Question</span>)
            try {
              await createQuestionMutation(values)
              toast.success(() => <span>Question Created</span>, { id: toastId })
              router.push(Routes.QuestionsHome())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
        />
      </div>
    </AuthLayout>
  )
}

export default NewQuestion
