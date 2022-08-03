import { ReactNode, Suspense } from "react"
import { Head } from "blitz"
import Navbar from "app/core/components/Navbar"
import { ExtendedUser, IntroHint, IntroStep } from "types"

type LayoutProps = {
  title?: string
  children: ReactNode
  user?: ExtendedUser | null
  hideNavbar?: boolean
  setNavbarIntroSteps?: (steps: IntroStep[]) => void
  setNavbarIntroHints?: (hints: IntroHint[]) => void
}

const AuthLayout = ({
  title,
  children,
  user,
  hideNavbar,
  setNavbarIntroSteps,
  setNavbarIntroHints,
}: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "hire-win"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        {!hideNavbar && (
          <Navbar
            user={user ? user : undefined}
            setNavbarIntroSteps={setNavbarIntroSteps}
            setNavbarIntroHints={setNavbarIntroHints}
          />
        )}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-gray-100">
            <div className="px-4 py-4 sm:px-0">
              <Suspense fallback="Loading...">{children}</Suspense>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default AuthLayout
