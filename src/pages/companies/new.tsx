import { gSSP } from "src/blitz-server"
import { useSession } from "@blitzjs/auth"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"
import AuthLayout from "src/core/layouts/AuthLayout"
import CompanyForm from "src/companies/components/CompanyForm"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import createCompany from "src/companies/mutations/createCompany"
import path from "path"
import { EditorState, convertToRaw } from "draft-js"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { Suspense } from "react"
import { initialInfo } from "src/companies/constants"
import createFactoryJob from "src/jobs/mutations/createFactoryJob"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import { CompanyUserRole } from "@prisma/client"
import { PlanName } from "types"
import { FREE_COMPANIES_LIMIT } from "src/plans/constants"
import UpgradeMessage from "src/plans/components/UpgradeMessage"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })

  if (user) {
    const activePlanName = await getCurrentCompanyOwnerActivePlan({}, context.ctx)

    return { props: { user, activePlanName } }
  } else {
    return {
      redirect: {
        destination: "/auth/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
})

const NewCompany = ({
  user,
  activePlanName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [createCompanyMutation] = useMutation(createCompany)
  const [createFactoryJobMutation] = useMutation(createFactoryJob)
  const [companyUsers] = useQuery(getCompanyUsers, {
    where: {
      // companyId: session.companyId || "0",
      userId: session.userId || "0",
      role: CompanyUserRole.OWNER,
    },
  })

  return (
    <AuthLayout title="New Company" user={user}>
      <div className="max-w-lg mx-auto">
        {activePlanName === PlanName.FREE && companyUsers?.length >= FREE_COMPANIES_LIMIT && (
          <div className="mt-2">
            <UpgradeMessage message="Upgrade to add more companies" />
          </div>
        )}
        <Suspense fallback="Loading...">
          {/* {companyUser && <Breadcrumbs />} */}
          <div className="mt-6">
            <CompanyForm
              activePlanName={activePlanName}
              onlyName={true}
              header="Create a company"
              // subHeader="You may add more companies later"
              initialValues={{
                name: "",
                // info: EditorState.createEmpty(),
                logo: null,
                website: "",
                theme: "indigo",
              }}
              onSubmit={async (values) => {
                if (companyUsers?.length >= 1) {
                  if (activePlanName === PlanName.FREE) {
                    if (companyUsers?.length >= FREE_COMPANIES_LIMIT) {
                      alert(
                        `You can only have ${FREE_COMPANIES_LIMIT} company with careers page on the free plan. Upgrade to the recruiter plan to add more companies.`
                      )
                      return
                    }
                  }
                }

                // if (values?.info) {
                //   values.info = convertToRaw(values?.info?.getCurrentContent())
                // }

                const toastId = toast.loading(() => <span>Creating Company</span>)
                try {
                  values["info"] = initialInfo

                  values["timezone"] = Intl?.DateTimeFormat()
                    ?.resolvedOptions()
                    ?.timeZone?.replace("Calcutta", "Kolkata")

                  const createdCompany = await createCompanyMutation(values)
                  if (createdCompany && companyUsers?.length === 0) {
                    await createFactoryJobMutation(createdCompany.id)
                  }

                  toast.success(() => <span>Company Created</span>, { id: toastId })

                  // If the user has come from the coupon redemption page,
                  // redirect back to the redemption page
                  if (router.query.next && router.query.next?.includes("redeem")) {
                    router.push(router.query.next as string)
                  } else {
                    router.push(Routes.JobsHome())
                  }
                } catch (error) {
                  toast.error(
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                  )
                }
              }}
            />
          </div>
        </Suspense>
      </div>
    </AuthLayout>
  )
}

export default NewCompany
