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
import { Routes } from "@blitzjs/next"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"

type LayoutProps = {
  children: ReactNode
  stageSlug: string
  jobSlug: string
}

const StageSettingsLayout = ({ children, stageSlug, jobSlug }: LayoutProps) => {
  const router = useRouter()
  // const session = useSession()

  // const [companyUser] = useQuery(getCompanyUser, {
  //   where: { userId: session.userId || "0", companyId: session.companyId || "0" },
  // })

  // const [parentCompanyUser] = useQuery(getParentCompanyUser, {
  //   where: {
  //     userId: session.userId || "0",
  //     parentCompanyId: companyUser?.company?.parentCompanyId || "0",
  //   },
  // })

  const subNavigation = [
    {
      name: "Stage Settings",
      href: Routes.StageSettingsPage({ slug: jobSlug, stageSlug: stageSlug })
        .pathname?.replaceAll("[stageSlug]", stageSlug)
        ?.replaceAll("[slug]", jobSlug),
      current:
        router.route === Routes.StageSettingsPage({ slug: jobSlug, stageSlug: stageSlug }).pathname,
      icon: CogIcon,
    },
    {
      name: "Score Card Config",
      href: Routes.ScoreCardSettingsPage({ slug: jobSlug, stageSlug: stageSlug })
        .pathname?.replaceAll("[stageSlug]", stageSlug)
        ?.replaceAll("[slug]", jobSlug),
      current:
        router.route ===
        Routes.ScoreCardSettingsPage({ slug: jobSlug, stageSlug: stageSlug }).pathname,
      icon: CreditCardIcon,
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

export default StageSettingsLayout
