import ParentCompanySettingsLayout from "src/core/layouts/ParentCompanySettingsLayout"
import UserSettingsLayout from "src/core/layouts/UserSettingsLayout"
import path from "path"
import { gSSP } from "src/blitz-server"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import { getSession } from "@blitzjs/auth"
import getCompany from "src/companies/queries/getCompany"
import Guard from "src/guard/ability"
import getParentCompany from "src/parent-companies/queries/getParentCompany"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { AuthorizationError } from "blitz"
import { InferGetServerSidePropsType } from "next"
import AuthLayout from "src/core/layouts/AuthLayout"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import { Suspense, useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getAllUserOwnedCompanies from "src/companies/queries/getAllUserOwnedCompanies"
import getSubCompaniesOfParentCompany from "src/parent-companies/queries/getSubCompaniesOfParentCompany"
import moment from "moment"
import db, { CompanyUserRole } from "db"
import Modal from "src/core/components/Modal"
import CompanyForm from "src/companies/components/CompanyForm"
import getParentCompanyUsers from "src/parent-companies/queries/getParentCompanyUsers"
import { PlanName } from "types"
import { FREE_COMPANIES_LIMIT } from "src/plans/constants"
import toast from "react-hot-toast"
import { initialInfo } from "src/companies/constants"
import createCompany from "src/companies/mutations/createCompany"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"

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
      where: { id: session.companyId || "0" },
    },
    { ...context.ctx }
  )

  const ownerCompanyUser = await db.companyUser.findFirst({
    where: { role: CompanyUserRole.OWNER, companyId: company?.id },
    include: { user: true },
  })

  // const currentPlan = checkPlan(company)

  const { can: canUpdate } = await Guard.can(
    "access",
    "parentCompanySettings",
    { ...context.ctx },
    {}
  )

  if (user) {
    try {
      if (canUpdate) {
        // const existingCompanyUserWhereOwner = await db.companyUser.findFirst({
        //   where: { userId: context?.ctx?.session?.userId || "0", role: CompanyUserRole.OWNER },
        //   include: { company: true },
        // })

        const parentCompany = await getParentCompany(
          { where: { id: company?.parentCompanyId || "0" } },
          context.ctx
        )

        const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

        return {
          props: {
            user,
            company,
            companyOwner: ownerCompanyUser?.user,
            parentCompany,
            canUpdate,
            activePlanName,
          } as any,
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
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return {
          props: {
            error: {
              statusCode: error.statusCode,
              message: "You don't have permission",
            },
          },
        }
      } else {
        return { props: { error: { statusCode: error.statusCode, message: error.message } } }
      }
    }
  } else {
    return {
      redirect: {
        destination: `/auth/login?next=/parentCompanys/${context?.params?.slug}/settings/members`,
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsSubCompaniesPage = ({
  user,
  company,
  companyOwner,
  parentCompany,
  canUpdate,
  activePlanName,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  const [subCompanies] = useQuery(getSubCompaniesOfParentCompany, {
    parentCompanyId: parentCompany?.id || "0",
  })

  const [openCreateCompanyModal, setOpenCreateCompanyModal] = useState(false)

  const [createCompanyMutation] = useMutation(createCompany)

  return (
    <>
      <AuthLayout title="Hire.win | Sub Companies" user={user}>
        <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
        <Suspense fallback="Loading...">
          <UserSettingsLayout>
            <ParentCompanySettingsLayout>
              <Modal
                header="Create company under parent company"
                open={openCreateCompanyModal}
                setOpen={setOpenCreateCompanyModal}
              >
                <CompanyForm
                  activePlanName={activePlanName}
                  onlyName={true}
                  header="Create a company under parent company"
                  // subHeader="You may add more companies later"
                  initialValues={{
                    name: "",
                    // info: EditorState.createEmpty(),
                    logo: null,
                    website: "",
                    theme: "indigo",
                  }}
                  onSubmit={async (values) => {
                    if (subCompanies?.length >= 1) {
                      if (activePlanName === PlanName.FREE) {
                        if (subCompanies?.length >= FREE_COMPANIES_LIMIT) {
                          alert(
                            `You can only have ${FREE_COMPANIES_LIMIT} company with careers page on the free plan. Upgrade to the recruiter plan to add more companies.`
                          )
                          return
                        }
                      }
                    }
                    const toastId = toast.loading(() => <span>Creating Company</span>)
                    try {
                      values["info"] = initialInfo
                      values["timezone"] = Intl?.DateTimeFormat()
                        ?.resolvedOptions()
                        ?.timeZone?.replace("Calcutta", "Kolkata")
                      values["parentCompanyId"] = parentCompany?.id
                      setOpenCreateCompanyModal(false)
                      await createCompanyMutation(values)
                      // If first company of user
                      // if (createdCompany && companyUsers?.length === 0) {
                      //   await createFactoryJobMutation(createdCompany.id)
                      //   // await sendWelcomeEmailAndAddToSendfoxMutation({
                      //   //   name: user?.name,
                      //   //   email: user?.email,
                      //   //   companySlug: createdCompany?.slug,
                      //   // })
                      // }
                      toast.success(() => <span>Company Created</span>, { id: toastId })
                      router.push(Routes.JobsHome())
                    } catch (error) {
                      toast.error(
                        "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                        { id: toastId }
                      )
                    }
                  }}
                />
              </Modal>
              <div className="p-6 bg-white">
                <p className="text-neutral-600 text-center text-lg font-medium">
                  All Sub Companies under{" "}
                  {user?.id === companyOwner?.id
                    ? "your Parent Company"
                    : `${company?.name} Company Holder (${companyOwner?.name}'s) Parent Company`}
                </p>
                <div className="flex items-center justify-center my-5">
                  <button
                    className="px-4 py-2 bg-theme-600 hover:bg-theme-800 rounded text-white"
                    onClick={() => {
                      setOpenCreateCompanyModal(true)
                    }}
                  >
                    Add New Company
                  </button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subCompanies?.map((subCompany) => {
                      return (
                        <div className="px-4 py-1 rounded-lg bg-theme-50 w-64">
                          <p className="text-neutral-700 truncate">{subCompany.name}</p>

                          {subCompany.createdBy && (
                            <p className="text-sm text-neutral-600 italic truncate">
                              Created by {subCompany.createdBy?.name}
                            </p>
                          )}

                          {subCompany.createdAt && (
                            <p className="text-xs text-neutral-600 italic truncate">
                              {moment(subCompany.createdAt).local().fromNow()}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ParentCompanySettingsLayout>
          </UserSettingsLayout>
        </Suspense>
      </AuthLayout>
    </>
  )
}

export default UserSettingsSubCompaniesPage
