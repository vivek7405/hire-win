import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import React, { ReactNode } from "react"
import { UserCircleIcon, CashIcon } from "@heroicons/react/outline"
import { ClockIcon } from "@heroicons/react/solid"
import getUser from "src/users/queries/getUser"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import { CompanyUserRole } from "@prisma/client"
import { Routes } from "@blitzjs/next"

type LayoutProps = {
  children: ReactNode
}

const AdminLayout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const session = useSession()

  const subNavigation = [
    {
      name: "Welcome",
      href: Routes.AdminHomePage().pathname,
      current: router.route === Routes.AdminHomePage().pathname,
      icon: UserCircleIcon,
    },
    {
      name: "Coupons",
      href: Routes.AdminCouponsPage().pathname,
      current: router.route === Routes.AdminCouponsPage().pathname,
      icon: CashIcon,
    },
  ]

  return (
    <div className="flex flex-col mt-6 md:flex-row md:space-x-4 lg:flex-row lg:space-x-4 bg-gray-100">
      <div className="w-full mb-6 md:mb-0 lg:mb-0 md:w-1/5 lg:w-1/5">
        {subNavigation.map((item) => {
          if (!item) return <></>

          return (
            <Link prefetch={true} href={item.href} passHref key={item.name} legacyBehavior>
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
          )
        })}
      </div>
      <div className="space-y-6 w-full md:w-4/5 lg:w-4/5">{children}</div>
    </div>
  )
}

export default AdminLayout
