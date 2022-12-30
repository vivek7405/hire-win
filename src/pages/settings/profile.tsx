import { gSSP } from "src/blitz-server"
import { getSession } from "@blitzjs/auth"
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
import getCompany from "src/companies/queries/getCompany"
import CompanyForm from "src/companies/components/CompanyForm"
import updateCompany from "src/companies/mutations/updateCompany"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import { Suspense } from "react"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)
  const company = await getCompany(
    {
      where: {
        id: session.companyId || "0",
      },
    },
    { ...context.ctx }
  )

  if (user && company) {
    return { props: { user, company } }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=/settings/profile",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsProfilePage = ({
  user,
  company,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const [updateUserMutation] = useMutation(updateUser)

  return (
    <AuthLayout title="Hire.win | Profile Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <UserSettingsLayout>
          <UserForm
            userId={user?.id}
            header="Profile"
            subHeader="Update your profile details"
            initialValues={{
              name: user?.name || "",
              email: user?.email || "",
              jobBoardName: user?.jobBoardName || "",
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
      </Suspense>
    </AuthLayout>
  )
}

UserSettingsProfilePage.suppressFirstRenderFlicker = true

export default UserSettingsProfilePage
