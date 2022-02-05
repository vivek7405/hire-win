import { Suspense } from "react"
import { InferGetServerSidePropsType, GetServerSidePropsContext, useQuery, useSession } from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import getActiveJobs from "app/admin/queries/admin/getActiveJobs"
import getChurnedJobs from "app/admin/queries/admin/getChurnedJobs"
import path from "path"
import Skeleton from "react-loading-skeleton"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user && user.role === "ADMIN") {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const Charts = () => {
  const [activeJobs] = useQuery(getActiveJobs, { where: {} })
  const [churnedJobs] = useQuery(getChurnedJobs, { where: {} })

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <div className="border rounded p-2">
        <h3 className="text-gray-600">💸 Paid Jobs</h3>
        <h2 className="text-3xl text-emerald-500">{activeJobs}</h2>
      </div>

      <div className="border rounded p-2">
        <h3 className="text-gray-600">Churned Jobs</h3>
        <h2 className="text-3xl">{churnedJobs}</h2>
      </div>
    </div>
  )
}

const Admin = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Admin | hire-win" user={user}>
      <AdminLayout>
        <Suspense
          fallback={<Skeleton height={"80px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
        >
          <Charts />
        </Suspense>
      </AdminLayout>
    </AuthLayout>
  )
}

Admin.authenticate = true

export default Admin
