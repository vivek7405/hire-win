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
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "app/core/utils/themeHelpers"
import UserSettingsLayout from "app/core/layouts/UserSettingsLayout"

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
        destination: "/login?next=settings/security",
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsSecurityPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)
  const [changePasswordMutation] = useMutation(changePassword)

  return (
    <AuthLayout title="Settings" user={user}>
      <UserSettingsLayout>
        <SecurityForm
          header="Security"
          subHeader="Update your account password"
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating password</span>)
            try {
              await changePasswordMutation({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              })
              toast.success(() => <span>Password Updated</span>, { id: toastId })
              router.push(Routes.JobsHome())
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
        />
      </UserSettingsLayout>
    </AuthLayout>
  )
}

UserSettingsSecurityPage.suppressFirstRenderFlicker = true

export default UserSettingsSecurityPage
