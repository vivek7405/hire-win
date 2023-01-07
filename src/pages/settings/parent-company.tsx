import { gSSP } from "src/blitz-server"
import { getSession } from "@blitzjs/auth"
import { useMutation } from "@blitzjs/rpc"
import { ErrorComponent, Routes } from "@blitzjs/next"
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
import { Suspense, useState } from "react"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"
import { CompanyUserRole, ParentCompanyUserRole } from "@prisma/client"
import ParentCompanySettingsLayout from "src/core/layouts/ParentCompanySettingsLayout"
import ParentCompanyForm from "src/parent-companies/components/ParentCompanyForm"
import db from "db"
import updateParentCompany from "src/parent-companies/mutations/updateParentCompany"
import Guard from "src/guard/ability"

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

  const ownerCompanyUser = await db.companyUser.findFirst({
    where: { role: CompanyUserRole.OWNER, companyId: company?.id },
    include: { user: true },
  })

  const { can: canUpdate } = await Guard.can(
    "access",
    "parentCompanySettings",
    { ...context.ctx },
    {}
  )

  if (user && company) {
    if (canUpdate) {
      // const existingCompanyUserWhereOwner = await db.companyUser.findFirst({
      //   where: { userId: context?.ctx?.session?.userId || "0", role: CompanyUserRole.OWNER },
      //   include: { company: true },
      // })

      const parentCompany = await db.parentCompany.findUnique({
        where: { id: company?.parentCompanyId },
      })
      const parentCompanyUser = await getParentCompanyUser(
        {
          where: {
            userId: user.id || "0",
            parentCompanyId: company?.parentCompanyId || "0",
          },
        },
        context.ctx
      )

      if (parentCompanyUser && parentCompanyUser?.role !== ParentCompanyUserRole.USER) {
        return { props: { user, company, companyOwner: ownerCompanyUser?.user, parentCompany } }
      } else {
        return {
          props: {
            error: {
              statusCode: 403,
              message: "You don't have permission",
            },
          },
        } as any
      }
    } else {
      return {
        props: {
          error: {
            statusCode: 403,
            message: "You don't have permission",
          },
        },
      }
    }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=/settings/parent-company",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsParentCompanyPage = ({
  user,
  company,
  companyOwner,
  parentCompany,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  const [showForm, setShowForm] = useState(false)

  return (
    <AuthLayout title="Hire.win | Parent Company Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        {parentCompany?.name ? (
          <UserSettingsLayout>
            <ParentCompanySettingsLayout>
              <ParentCompanyFormComponent
                user={user}
                company={company}
                companyOwner={companyOwner}
                parentCompany={parentCompany}
                onSubmit={null}
              />
            </ParentCompanySettingsLayout>
          </UserSettingsLayout>
        ) : (
          <UserSettingsLayout>
            {showForm ? (
              <ParentCompanyFormComponent
                user={user}
                company={company}
                companyOwner={companyOwner}
                parentCompany={parentCompany}
                onSubmit={() => {
                  router.reload()
                }}
              />
            ) : (
              <div className="bg-white p-6">
                <div className="text-neutral-600 italic">
                  If you are a staffing agency or a group of companies, you can setup a Parent
                  Company to use common tools across multiple companies.
                </div>
                <div className="mt-6">
                  <button
                    className="px-4 py-2 rounded bg-theme-600 hover:bg-theme-800 text-white"
                    onClick={() => {
                      setShowForm(true)
                    }}
                  >
                    Setup Parent Company
                  </button>
                </div>
              </div>
            )}
          </UserSettingsLayout>
        )}
      </Suspense>
    </AuthLayout>
  )
}

const ParentCompanyFormComponent = ({ user, company, companyOwner, parentCompany, onSubmit }) => {
  const [updateParentCompanyMutation] = useMutation(updateParentCompany)

  return (
    <>
      <ParentCompanyForm
        slug={parentCompany?.slug}
        header={
          user?.id === companyOwner?.id
            ? "Your Parent Company"
            : `${company?.name} Company Holder (${companyOwner?.name}'s) Parent Company`
        }
        subHeader="Parent company details"
        initialValues={{
          name: parentCompany?.name || "",
          // logo: company?.logo,
          // info: company?.info
          //   ? EditorState.createWithContent(convertFromRaw(company?.info || {}))
          //   : EditorState.createEmpty(),
          // website: company?.website || "",
          // theme: company?.theme || "indigo",
        }}
        onSubmit={async (values) => {
          const toastId = toast.loading(() => <span>Updating Parent Company</span>)
          try {
            await updateParentCompanyMutation({
              where: { id: parentCompany?.id },
              data: { ...values },
              initial: parentCompany!,
            })
            onSubmit && onSubmit()
            toast.success(() => <span>Parent Company Updated</span>, { id: toastId })
          } catch (error) {
            toast.error(
              "Sorry, we had an unexpected error. Please try again. - " + error.toString()
            )
          }
        }}
      />
    </>
  )
}

UserSettingsParentCompanyPage.suppressFirstRenderFlicker = true

export default UserSettingsParentCompanyPage
