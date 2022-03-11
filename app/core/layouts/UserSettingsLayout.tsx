import React, { ReactNode } from "react"
import { useRouter, Link } from "blitz"
import { CreditCardIcon, CogIcon, KeyIcon } from "@heroicons/react/outline"
import { ExtendedUser } from "types"

type LayoutProps = {
  children: ReactNode
}

const UserSettingsLayout = ({ children }: LayoutProps) => {
  const router = useRouter()

  const subNavigation = [
    {
      name: "Profile",
      href: `/settings`,
      current: router.route === `/settings`,
      icon: CogIcon,
    },
    {
      name: "Billing",
      href: `/settings/billing`,
      current: router.route === `/settings/billing`,
      icon: CreditCardIcon,
    },
    {
      name: "Security",
      href: `/settings/security`,
      current: router.route === `/settings/security`,
      icon: KeyIcon,
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row mt-6 lg:space-x-4">
      <div className="w-full mb-6 lg:mb-0 lg:w-1/5">
        {subNavigation.map((item) => (
          <Link href={item.href} passHref key={item.name}>
            <a
              data-testid={`${item.name}-userSettingsLink`}
              className={`${
                item.current
                  ? "bg-gray-50 text-theme-600 hover:bg-white"
                  : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
              } group px-3 py-2 flex items-center text-sm font-medium`}
            >
              <item.icon
                className={`${
                  item.current ? "text-theme-500" : "text-gray-400 group-hover:text-gray-500"
                }shrink-0 -ml-1 mr-3 h-6 w-6`}
              />
              <span className="truncate">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
      <div className="space-y-6 w-full">{children}</div>
    </div>
  )
}

export default UserSettingsLayout
