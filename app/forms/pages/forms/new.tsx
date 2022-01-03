import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import FormForm from "app/forms/components/FormForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createForm from "app/forms/mutations/createForm"
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

const NewForm = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [createFormMutation] = useMutation(createForm)

  return (
    <AuthLayout title="New Form" user={user}>
      <Breadcrumbs />
      <div className="mt-6">
        <FormForm
          header="Create A New Form"
          subHeader="Enter your form details."
          initialValues={{
            name: "",
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Form</span>)
            try {
              await createFormMutation(values)
              toast.success(() => <span>Form Created</span>, { id: toastId })
              router.push(Routes.FormsHome())
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

export default NewForm
