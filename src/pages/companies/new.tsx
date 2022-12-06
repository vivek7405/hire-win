import { gSSP } from "src/blitz-server";
import { useSession } from "@blitzjs/auth";
import { useMutation, useQuery } from "@blitzjs/rpc";
import { Routes } from "@blitzjs/next";
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
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
        destination: "/auth/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
})

const NewCompany = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [createCompanyMutation] = useMutation(createCompany)
  const [companyUser] = useQuery(getCompanyUser, {
    where: {
      companyId: session.companyId || "0",
      userId: session.userId || "0",
    },
  })

  return (
    <AuthLayout title="New Company" user={user}>
      <div className="max-w-lg mx-auto">
        <Suspense fallback="Loading...">
          {/* {companyUser && <Breadcrumbs />} */}
          <div className="mt-6">
            <CompanyForm
              header="Create A New Company"
              subHeader="Enter your company details"
              initialValues={{
                name: "",
                // info: EditorState.createEmpty(),
                logo: null,
                website: "",
                theme: "indigo",
              }}
              onSubmit={async (values) => {
                // if (values?.info) {
                //   values.info = convertToRaw(values?.info?.getCurrentContent())
                // }

                const toastId = toast.loading(() => <span>Creating Company</span>)
                try {
                  await createCompanyMutation(values)
                  toast.success(() => <span>Company Created</span>, { id: toastId })
                  router.push(Routes.JobsHome())
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