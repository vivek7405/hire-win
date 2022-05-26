import { ReactNode, Suspense, useEffect } from "react"
import { Head, useQuery, useSession } from "blitz"
import Navbar from "app/core/components/Navbar"
import { ExtendedUser } from "types"
import getCompanyUser from "app/companies/queries/getCompanyUser"

type LayoutProps = {
  title?: string
  children: ReactNode
  user?: ExtendedUser | null
  hideNavbar?: boolean
}

const AuthLayout = ({ title, children, user, hideNavbar }: LayoutProps) => {
  const session = useSession()
  const [companyUser] = useQuery(getCompanyUser, {
    where: {
      companyId: session.companyId || 0,
      userId: session.userId || 0,
    },
  })

  return (
    <>
      <Suspense fallback="Loading...">
        <Head>
          <title>{title || "hire-win"}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen">
          {!hideNavbar && companyUser && <Navbar user={user ? user : undefined} />}
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-gray-100">
              <div className="px-4 py-4 sm:px-0">{children}</div>
            </div>
          </main>
        </div>
      </Suspense>
    </>
  )
}

export default AuthLayout
