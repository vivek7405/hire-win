import { gSSP } from "src/blitz-server"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "src/users/components/UserForm"
import SecurityForm from "src/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "src/users/mutations/updateUser"
import changePassword from "src/auth/mutations/changePassword"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "src/core/utils/themeHelpers"
import UserSettingsLayout from "src/core/layouts/UserSettingsLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import { Suspense } from "react"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
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
        destination: "/auth/login?next=/settings/security",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsSecurityPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)
  const [changePasswordMutation] = useMutation(changePassword)

  return (
    <AuthLayout title="Hire.win | Security Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <UserSettingsLayout>
          <SecurityForm
            user={user}
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
      </Suspense>
    </AuthLayout>
  )
}

UserSettingsSecurityPage.suppressFirstRenderFlicker = true

export default UserSettingsSecurityPage
