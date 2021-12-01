import { ReactNode } from "react"
import { Head } from "blitz"
import Navbar from "app/core/components/Navbar"
import { ExtendedUser } from "types"

type LayoutProps = {
  title?: string
  children: ReactNode
  user?: ExtendedUser | null
}

const Layout = ({ title, children, user }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "hire-win"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar user={user ? user : undefined} />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-gray-100 min-h-screen">
          <div className="px-4 py-4 sm:px-0">{children}</div>
        </div>
      </main>
    </>
  )
}

export default Layout
