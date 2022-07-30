import { Suspense } from "react"
import { InferGetServerSidePropsType, GetServerSidePropsContext, useQuery, useSession } from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import AdminLayout from "app/core/layouts/AdminLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import getActiveWorkspaces from "app/admin/queries/admin/getActiveWorkspaces"
import getChurnedWorkspaces from "app/admin/queries/admin/getChurnedWorkspaces"
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
  const [activeWorkspaces] = useQuery(getActiveWorkspaces, { where: {} })
  const [churnedWorkspaces] = useQuery(getChurnedWorkspaces, { where: {} })

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <div className="border rounded p-2">
        <h3 className="text-gray-600">💸 Paid Workspaces</h3>
        <h2 className="text-3xl text-green-500">{activeWorkspaces}</h2>
      </div>

      <div className="border rounded p-2">
        <h3 className="text-gray-600">Churned Workspaces</h3>
        <h2 className="text-3xl">{churnedWorkspaces}</h2>
      </div>
    </div>
  )
}

const Admin = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Admin | 1UpBlitz" user={user}>
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
