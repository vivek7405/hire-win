import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import React, { ReactNode } from "react"
import { KeyIcon, UserCircleIcon } from "@heroicons/react/outline"
import { Routes } from "@blitzjs/next"

type LayoutProps = {
  children: ReactNode
}

const ProfileSettingsLayout = ({ children }: LayoutProps) => {
  const router = useRouter()

  const subNavigation = [
    {
      name: "Details",
      href: Routes.UserSettingsProfilePage().pathname,
      current: router.route === Routes.UserSettingsProfilePage().pathname,
      icon: UserCircleIcon,
    },
    {
      name: "Security",
      href: Routes.UserSettingsSecurityPage().pathname,
      current: router.route === Routes.UserSettingsSecurityPage().pathname,
      icon: KeyIcon,
    },
  ]

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="w-full flex flex-col md:flex-row items-center justify-center md:space-x-2">
        {subNavigation.map((item) => {
          if (!item) return <></>

          return (
            <Link
              replace={true}
              prefetch={true}
              href={item.href}
              passHref
              key={item.name}
              legacyBehavior
            >
              <a
                data-testid={`${item.name}-userSettingsLink`}
                className={`${
                  item.current
                    ? "bg-gray-100 text-theme-600"
                    : "bg-gray-50 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                } group px-3 py-2 flex items-center text-sm font-medium w-full`}
              >
                <item.icon
                  className={`${
                    item.current ? "text-theme-500" : "text-gray-400 group-hover:text-gray-500"
                  }shrink-0 -ml-1 mr-3 h-6 w-6`}
                />
                <span className="truncate">{item.name}</span>
              </a>
            </Link>
          )
        })}
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}

export default ProfileSettingsLayout
