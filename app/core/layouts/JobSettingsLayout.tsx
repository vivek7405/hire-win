import React, { ReactNode, Suspense } from "react"
import { useRouter, Link } from "blitz"
import {
  CreditCardIcon,
  CogIcon,
  UserGroupIcon,
  KeyIcon,
  ClockIcon,
} from "@heroicons/react/outline"
import { ExtendedJob } from "types"

type LayoutProps = {
  children: ReactNode
  job: ExtendedJob
}

const JobSettingsLayout = ({ job, children }: LayoutProps) => {
  const router = useRouter()

  const subNavigation = [
    {
      name: "Details",
      href: `/jobs/${job?.slug}/settings`,
      current: router.route === `/jobs/[slug]/settings`,
      icon: CogIcon,
      canView: true,
    },
    {
      name: "Members",
      href: `/jobs/${job?.slug}/settings/members`,
      current: router.route === `/jobs/[slug]/settings/members`,
      icon: UserGroupIcon,
      canView: true,
    },
    {
      name: "Scheduling",
      href: `/jobs/${job?.slug}/settings/scheduling`,
      current: router.route === `/jobs/[slug]/settings/scheduling`,
      icon: ClockIcon,
      canView: true,
    },
    // {
    //   name: "API Keys",
    //   href: `/jobs/${job?.slug}/settings/keys`,
    //   current: router.route === `/jobs/[slug]/settings/keys`,
    //   icon: KeyIcon,
    //   canView: true,
    // },
  ]

  return (
    <div className="flex flex-col lg:flex-row mt-6 lg:space-x-4">
      <div className="mb-6 lg:mb-0 w-full lg:w-1/5">
        {subNavigation.map(
          (item) =>
            item.canView && (
              <Link prefetch={true} href={item.href} passHref key={item.name}>
                <a
                  data-testid={`${item.name}-jobSettingsLink`}
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
        )}
      </div>
      <div className="space-y-6 w-full lg:w-4/5">
        <Suspense fallback="Loading">{children}</Suspense>
      </div>
    </div>
  )
}

export default JobSettingsLayout
