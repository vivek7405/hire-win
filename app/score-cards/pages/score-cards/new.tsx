import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import ScoreCardForm from "app/score-cards/components/ScoreCardForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createScoreCard from "app/score-cards/mutations/createScoreCard"
import path from "path"

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

const NewScoreCard = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createScoreCardMutation] = useMutation(createScoreCard)

  return (
    <AuthLayout title="New ScoreCard" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <ScoreCardForm
          header="Create A New Score Card"
          subHeader="Enter your score card details"
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating ScoreCard</span>)
            try {
              await createScoreCardMutation(values)
              toast.success(() => <span>Score Card Created</span>, { id: toastId })
              router.push(Routes.ScoreCardsHome())
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

export default NewScoreCard
