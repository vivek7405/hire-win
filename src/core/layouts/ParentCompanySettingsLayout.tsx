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
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"
import { ParentCompanyUserRole } from "@prisma/client"
import { Routes } from "@blitzjs/next"
import getCompany from "src/companies/queries/getCompany"
import getExistingCompanyUserWhereOwner from "src/parent-companies/queries/getExistingCompanyUserWhereOwner"

type LayoutProps = {
  children: ReactNode
}

const ParentCompanySettingsLayout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const session = useSession()

  // const [existingCompanyUserWhereOwner] = useQuery(getExistingCompanyUserWhereOwner, {})

  const [company] = useQuery(getCompany, {
    where: { id: session.companyId || "0" },
  })

  const [parentCompanyUser] = useQuery(getParentCompanyUser, {
    where: {
      userId: session.userId || "0",
      parentCompanyId: company?.parentCompanyId || "0",
    },
  })

  const subNavigation = [
    parentCompanyUser &&
    (parentCompanyUser?.parentCompany?.name
      ? parentCompanyUser?.role !== ParentCompanyUserRole.USER
      : parentCompanyUser?.role === ParentCompanyUserRole.OWNER)
      ? {
          name: "Details",
          href: Routes.UserSettingsParentCompanyPage().pathname,
          current: router.route === Routes.UserSettingsParentCompanyPage().pathname,
          icon: LibraryIcon,
        }
      : null,
    parentCompanyUser &&
    (parentCompanyUser?.parentCompany?.name
      ? parentCompanyUser?.role !== ParentCompanyUserRole.USER
      : parentCompanyUser?.role === ParentCompanyUserRole.OWNER)
      ? {
          name: "Members",
          href: Routes.UserSettingsParentMembersPage().pathname,
          current: router.route === Routes.UserSettingsParentMembersPage().pathname,
          icon: UserGroupIcon,
        }
      : null,
    parentCompanyUser &&
    (parentCompanyUser?.parentCompany?.name
      ? parentCompanyUser?.role !== ParentCompanyUserRole.USER
      : parentCompanyUser?.role === ParentCompanyUserRole.OWNER)
      ? {
          name: "Sub Companies",
          href: Routes.UserSettingsSubCompaniesPage().pathname,
          current: router.route === Routes.UserSettingsSubCompaniesPage().pathname,
          icon: OfficeBuildingIcon,
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
                    ? "bg-white text-theme-600"
                    : "bg-gray-50 text-gray-900 hover:text-gray-900 hover:bg-white"
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

export default ParentCompanySettingsLayout
