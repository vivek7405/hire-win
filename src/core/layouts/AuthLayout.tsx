import Head from "next/head"
import { ReactNode, Suspense } from "react"
import Navbar from "src/core/components/Navbar"
import { IntroHint, IntroStep } from "types"
import Link from "next/link"
import Script from "next/script"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"

type LayoutProps = {
  title?: string
  children: ReactNode
  user?: Awaited<ReturnType<typeof getCurrentUserServer>> | null
  hideNavbar?: boolean
  isMax8xl?: boolean
  setNavbarIntroSteps?: (steps: IntroStep[]) => void
  setNavbarIntroHints?: (hints: IntroHint[]) => void
}

const AuthLayout = ({
  title,
  children,
  user,
  hideNavbar,
  isMax8xl,
  setNavbarIntroSteps,
  setNavbarIntroHints,
}: LayoutProps) => {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src="https://embed.tawk.to/6364c8c8b0d6371309cd3d09/1gh0r0k2g"
      />
      <Head>
        <title>{title || "hire-win"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        {!hideNavbar && (
          <Suspense fallback="Loading...">
            <Navbar
              user={user ? user : undefined}
              setNavbarIntroSteps={setNavbarIntroSteps}
              setNavbarIntroHints={setNavbarIntroHints}
            />
          </Suspense>
        )}
        <main>
          <div
            className={`${
              isMax8xl ? "max-w-8xl" : "max-w-7xl"
            } mx-auto py-6 px-4 md:px-8 lg:px-8`}
          >
            <Suspense fallback="Loading...">{children}</Suspense>
          </div>
        </main>
      </div>
    </>
  )
}

export default AuthLayout
