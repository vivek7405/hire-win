import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import StageForm from "app/stages/components/StageForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createStage from "app/stages/mutations/createStage"
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

const NewStage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createStageMutation] = useMutation(createStage)

  return (
    <AuthLayout title="New Stage" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <StageForm
          header="Create A New Stage"
          subHeader="Enter your stage details."
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Stage</span>)
            try {
              await createStageMutation(values)
              toast.success(() => <span>Stage Created</span>, { id: toastId })
              router.push(Routes.StagesHome())
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

export default NewStage
