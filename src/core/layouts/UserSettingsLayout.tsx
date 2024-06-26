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

const UserSettingsLayout = ({ children }: LayoutProps) => {
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
    companyUser?.role === CompanyUserRole.OWNER || companyUser?.role === CompanyUserRole.ADMIN
      ? {
          name: "Company",
          href: Routes.UserSettingsCompanyPage().pathname,
          current:
            router.route === Routes.UserSettingsCompanyPage().pathname ||
            router.route === Routes.UserSettingsMembersPage().pathname,
          icon: OfficeBuildingIcon,
        }
      : null,
    parentCompanyUser &&
    (parentCompanyUser?.parentCompany?.name
      ? parentCompanyUser?.role !== ParentCompanyUserRole.USER
      : parentCompanyUser?.role === ParentCompanyUserRole.OWNER)
      ? {
          name: "Parent Company",
          href: Routes.UserSettingsParentCompanyPage().pathname,
          current:
            router.route === Routes.UserSettingsParentCompanyPage().pathname ||
            router.route === Routes.UserSettingsSubCompaniesPage().pathname ||
            router.route === Routes.UserSettingsParentMembersPage().pathname,
          icon: LibraryIcon,
        }
      : null,
    // companyUser?.role === CompanyUserRole.OWNER || companyUser?.role === CompanyUserRole.ADMIN
    //   ? {
    //       name: "Members",
    //       href: Routes.UserSettingsMembersPage().pathname,
    //       current: router.route === Routes.UserSettingsMembersPage().pathname,
    //       icon: UserGroupIcon,
    //     }
    //   : null,
    {
      name: "Profile",
      href: Routes.UserSettingsProfilePage().pathname,
      current:
        router.route === Routes.UserSettingsProfilePage().pathname ||
        router.route === Routes.UserSettingsSecurityPage().pathname,
      icon: UserCircleIcon,
    },
    // {
    //   name: "Security",
    //   href: Routes.UserSettingsSecurityPage().pathname,
    //   current: router.route === Routes.UserSettingsSecurityPage().pathname,
    //   icon: KeyIcon,
    // },
    {
      name: "Scheduling",
      href: Routes.UserSettingsAvailabilitiesPage().pathname,
      current:
        router.route === Routes.UserSettingsAvailabilitiesPage().pathname ||
        router.route === Routes.UserSettingsCalendarsPage().pathname,
      icon: ClockIcon,
    },
    // {
    //   name: "Availabilities",
    //   href: Routes.UserSettingsAvailabilitiesPage().pathname,
    //   current: router.route === Routes.UserSettingsAvailabilitiesPage().pathname,
    //   icon: ClockIcon,
    // },
    // {
    //   name: "Calendars",
    //   href: Routes.UserSettingsCalendarsPage().pathname,
    //   current: router.route === Routes.UserSettingsCalendarsPage().pathname,
    //   icon: CalendarIcon,
    // },
    companyUser?.role === CompanyUserRole.OWNER
      ? {
          name: "Billing",
          href: `/settings/billing`,
          current: router.route === `/settings/billing`,
          icon: CreditCardIcon,
        }
      : null,
  ]

  return (
    <div className="bg-white flex flex-col mt-6 md:flex-row md:space-x-4 lg:flex-row lg:space-x-4">
      <div className="w-full mb-6 md:mb-0 lg:mb-0 md:w-1/5 lg:w-1/5">
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
          )
        })}
      </div>
      <div className="space-y-6 w-full md:w-4/5 lg:w-4/5">{children}</div>
    </div>
  )
}

export default UserSettingsLayout
