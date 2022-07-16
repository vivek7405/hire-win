import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  Routes,
  useMutation,
  getSession,
  invokeWithMiddleware,
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
import getCompany from "app/companies/queries/getCompany"
import CompanyForm from "app/companies/components/CompanyForm"
import updateCompany from "app/companies/mutations/updateCompany"
import Breadcrumbs from "app/core/components/Breadcrumbs"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const company = await invokeWithMiddleware(
    getCompany,
    {
      where: {
        id: session.companyId || 0,
      },
    },
    { ...context }
  )

  if (user && company) {
    return { props: { user, company } }
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

const UserSettingsPage = ({
  user,
  company,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)

  return (
    <AuthLayout title="Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <UserSettingsLayout>
        <UserForm
          header="Profile"
          subHeader="Update your profile details"
          initialValues={{
            name: user?.name || "",
            email: user?.email || "",
            // logo: company?.logo,
            // info: company?.info
            //   ? EditorState.createWithContent(convertFromRaw(company?.info || {}))
            //   : EditorState.createEmpty(),
            // website: company?.website || "",
            // theme: company?.theme || "indigo",
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Updating User</span>)
            try {
              await updateUserMutation({
                where: { id: user?.id },
                data: { ...values },
                initial: user!,
              })
              toast.success(() => <span>User Updated</span>, { id: toastId })
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
