import { gSSP } from "src/blitz-server"
import getUser from "src/users/queries/getUser"
import path from "path"
import AuthLayout from "src/core/layouts/AuthLayout"
import AdminLayout from "src/core/layouts/AdminLayout"
import { InferGetServerSidePropsType } from "next"

export const getServerSideProps = gSSP(async (context) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getUser(
    { where: { id: context.ctx?.session?.userId || "0" } },
    { ...context.ctx }
  )

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
})

const AdminHomePage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title={`Hire.win | Admin`} user={user}>
      <AdminLayout>
        <div>Welcome to the Admin Page!</div>
      </AdminLayout>
    </AuthLayout>
  )
}

AdminHomePage.authenticate = true

export default AdminHomePage
