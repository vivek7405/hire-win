import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  Routes,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "app/users/components/UserForm"
import SecurityForm from "app/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "app/users/mutations/updateUser"
import changePassword from "app/auth/mutations/changePassword"

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
        destination: "/login?next=settings",
        permanent: false,
      },
      props: {},
    }
  }
}

const Settings = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)
  const [changePasswordMutation] = useMutation(changePassword)
  return (
    <AuthLayout title="Settings" user={user}>
      <UserForm
        header="Profile"
        subHeader="Update your profile details."
        initialValues={{
          avatar: user?.avatar,
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating User</span>)
          try {
            await updateUserMutation({
              where: { id: user?.id },
              data: { ...values },
            })
            toast.success(() => <span>User Updated</span>, { id: toastId })
            router.push(Routes.Home())
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />

      <div className="mt-6">
        <SecurityForm
          header="Security"
          subHeader="Update your account password."
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating password</span>)
            try {
              await changePasswordMutation({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              })
              toast.success(() => <span>Password Updated</span>, { id: toastId })
              router.push(Routes.Home())
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

Settings.suppressFirstRenderFlicker = true

export default Settings
