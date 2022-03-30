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
        destination: "/login?next=settings",
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsPage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)
  const [changePasswordMutation] = useMutation(changePassword)

  return (
    <AuthLayout title="Settings" user={user}>
      <UserSettingsLayout>
        <UserForm
          header="Profile"
          subHeader="Update your profile details"
          initialValues={{
            logo: user?.logo,
            companyName: user?.companyName || "",
            companyInfo: user?.companyInfo
              ? EditorState.createWithContent(convertFromRaw(user?.companyInfo || {}))
              : EditorState.createEmpty(),
            website: user?.website || "",
            theme: user?.theme || "indigo",
          }}
          onSubmit={async (values) => {
            values.companyInfo = convertToRaw(values?.companyInfo?.getCurrentContent())
            const toastId = toast.loading(() => <span>Updating User</span>)
            try {
              const updatedUser = await updateUserMutation({
                where: { id: user?.id },
                data: { ...values },
                initial: user!,
              })
              toast.success(() => <span>User Updated</span>, { id: toastId })
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

UserSettingsPage.suppressFirstRenderFlicker = true

export default UserSettingsPage
