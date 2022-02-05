import { ReactNode, useEffect, useState } from "react"
import { Head } from "blitz"
import Navbar from "app/core/components/Navbar"
import { ExtendedUser } from "types"
import { useThemeContext } from "../hooks/useTheme"

type LayoutProps = {
  title?: string
  children: ReactNode
  user?: ExtendedUser | null
  hideNavbar?: boolean
}

const AuthLayout = ({ title, children, user, hideNavbar }: LayoutProps) => {
  const { theme, setTheme } = useThemeContext()
  useEffect(() => {
    const themeName = user?.theme || process.env.DEFAULT_THEME || "indigo"
    setTheme(themeName)
  }, [setTheme, user?.theme])

  return (
    <>
      <Head>
        <title>{title || "hire-win"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        {!hideNavbar && <Navbar user={user ? user : undefined} />}
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-gray-100">
            <div className="px-4 py-4 sm:px-0">{children}</div>
          </div>
        </main>
      </div>
    </>
  )
}

export default AuthLayout
