import { gSSP } from "src/blitz-server"
import Link from "next/link"
import { useSession, getSession } from "@blitzjs/auth"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Routes, ErrorComponent } from "@blitzjs/next"
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
import SubscribeButton from "src/users/components/SubscribeButton"
import { Plan } from "types"
import { CheckIcon, ExternalLinkIcon } from "@heroicons/react/outline"
import createStripeBillingPortal from "src/companies/mutations/createStripeBillingPortal"
import { checkPlan } from "src/companies/utils/checkPlan"
import getCompany from "src/companies/queries/getCompany"
import updateCompany from "src/companies/mutations/updateCompany"
import CompanyForm from "src/companies/components/CompanyForm"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { CompanyUserRole } from "@prisma/client"
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
  const company = await getCompany({ where: { id: session.companyId || "0" } }, { ...context.ctx })

  if (user && company) {
    return {
      props: {
        user,
        company,
      },
    }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=settings/billing",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsCompanyPage = ({
  user,
  company,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [createStripeBillingPortalMutation] = useMutation(createStripeBillingPortal)
  const [updateCompanyMutation] = useMutation(updateCompany)
  const session = useSession()
  const [companyUser] = useQuery(getCompanyUser, {
    where: { userId: session.userId || "0", companyId: session.companyId || "0" },
  })

  return (
    <>
      {companyUser?.role === CompanyUserRole.OWNER ||
      companyUser?.role === CompanyUserRole.ADMIN ? (
        <AuthLayout title="Settings | Company" user={user}>
          <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
          <Suspense fallback="Loading...">
            <UserSettingsLayout>
              <CompanyForm
                header="Company"
                subHeader="Update your company details"
                initialValues={{
                  name: company?.name || "",
                  logo: company?.logo,
                  info: company?.info,
                  // ? EditorState.createWithContent(convertFromRaw(company?.info || {}))
                  // : EditorState.createEmpty(),
                  website: company?.website || "",
                  theme: company?.theme || "indigo",
                }}
                companySlugForCareersPage={company?.slug || "0"}
                onSubmit={async (values) => {
                  // if (values?.info) {
                  //   values.info = convertToRaw(values?.info?.getCurrentContent())
                  // }

                  const toastId = toast.loading(() => <span>Updating Company details</span>)
                  try {
                    await updateCompanyMutation({
                      where: { id: company?.id },
                      data: { ...values },
                      initial: company!,
                    })
                    toast.success(() => <span>Company details Updated</span>, { id: toastId })
                  } catch (error) {
                    toast.error(
                      "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                      { id: toastId }
                    )
                  }
                }}
              />
            </UserSettingsLayout>
          </Suspense>
        </AuthLayout>
      ) : (
        <ErrorComponent statusCode={401} title="You are not authorized to access this page" />
      )}
    </>
  )
}

UserSettingsCompanyPage.suppressFirstRenderFlicker = true

export default UserSettingsCompanyPage
