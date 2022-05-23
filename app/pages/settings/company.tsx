import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  Routes,
  useMutation,
  useSession,
  getSession,
  invokeWithMiddleware,
  useQuery,
  ErrorComponent,
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
import SubscribeButton from "app/users/components/SubscribeButton"
import { Plan } from "types"
import { CheckIcon } from "@heroicons/react/outline"
import createStripeBillingPortal from "app/users/mutations/createStripeBillingPortal"
import { checkPlan } from "app/users/utils/checkPlan"
import { plans } from "app/core/utils/plans"
import getCompany from "app/companies/queries/getCompany"
import updateCompany from "app/companies/mutations/updateCompany"
import CompanyForm from "app/companies/components/CompanyForm"
import getCompanyUser from "app/companies/queries/getCompanyUser"
import { CompanyUserRole } from "@prisma/client"

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
    { where: { id: session.companyId || 0 } },
    { ...context }
  )

  if (user && company) {
    return {
      props: {
        plans,
        user,
        company,
        currentPlan: checkPlan(company) as Plan | null,
      },
    }
  } else {
    return {
      redirect: {
        destination: "/login?next=settings/billing",
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsCompanyPage = ({
  plans,
  user,
  company,
  currentPlan,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)
  const [updateCompanyMutation] = useMutation(updateCompany)
  const session = useSession()
  const [companyUser] = useQuery(getCompanyUser, {
    where: { userId: session.userId || 0, companyId: session.companyId || 0 },
  })

  return (
    <>
      {companyUser?.role === CompanyUserRole.OWNER ? (
        <AuthLayout title="Settings | Company" user={user}>
          <UserSettingsLayout>
            <CompanyForm
              header="Company"
              subHeader="Update your company details"
              initialValues={{
                name: company?.name || "",
                logo: company?.logo,
                info: company?.info
                  ? EditorState.createWithContent(convertFromRaw(company?.info || {}))
                  : EditorState.createEmpty(),
                website: company?.website || "",
                theme: company?.theme || "indigo",
              }}
              onSubmit={async (values) => {
                values.info = convertToRaw(values?.info?.getCurrentContent())
                const toastId = toast.loading(() => <span>Updating Company details</span>)
                try {
                  await updateCompanyMutation({
                    where: { id: company?.id },
                    data: { ...values },
                    initial: company!,
                  })
                  toast.success(() => <span>Company details Updated</span>, { id: toastId })
                  // router.push(Routes.JobsHome())
                } catch (error) {
                  toast.error(
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                    { id: toastId }
                  )
                }
              }}
            />
          </UserSettingsLayout>
        </AuthLayout>
      ) : (
        <ErrorComponent statusCode={401} title="You are not authorized to access this page" />
      )}
    </>
  )
}

UserSettingsCompanyPage.suppressFirstRenderFlicker = true

export default UserSettingsCompanyPage
