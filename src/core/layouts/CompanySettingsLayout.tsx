import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import React, { ReactNode } from "react"
import {
  CreditCardIcon,
  CogIcon,
  KeyIcon,
  CalendarIcon,
  UserGroupIcon,
  OfficeBuildingIcon,
  UserCircleIcon,
  LibraryIcon,
} from "@heroicons/react/outline"
import { ClockIcon } from "@heroicons/react/solid"
import getUser from "src/users/queries/getUser"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { CompanyUserRole, ParentCompanyUserRole } from "@prisma/client"
import { Routes } from "@blitzjs/next"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"

type LayoutProps = {
  children: ReactNode
}

const CompanySettingsLayout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const session = useSession()

  const [companyUser] = useQuery(getCompanyUser, {
    where: { userId: session.userId || "0", companyId: session.companyId || "0" },
  })

  const [parentCompanyUser] = useQuery(getParentCompanyUser, {
    where: {
      userId: session.userId || "0",
      parentCompanyId: companyUser?.company?.parentCompanyId || "0",
    },
  })

  const subNavigation = [
    {
      name: "Details",
      href: Routes.UserSettingsCompanyPage().pathname,
      current: router.route === Routes.UserSettingsCompanyPage().pathname,
      icon: OfficeBuildingIcon,
    },
    companyUser?.role === CompanyUserRole.OWNER || companyUser?.role === CompanyUserRole.ADMIN
      ? {
          name: "Members",
          href: Routes.UserSettingsMembersPage().pathname,
          current: router.route === Routes.UserSettingsMembersPage().pathname,
          icon: UserGroupIcon,
        }
      : null,
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
                    ? "bg-gray-50 text-theme-600 hover:bg-white"
                    : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
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

export default CompanySettingsLayout
