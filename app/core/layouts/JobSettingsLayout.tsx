import React, { ReactNode, Suspense } from "react"
import { useRouter, Link, useSession, useQuery } from "blitz"
import { UserGroupIcon, ClockIcon, CollectionIcon } from "@heroicons/react/outline"
import { ExtendedJob } from "types"
import { JobUserRole } from "@prisma/client"
import getJobUser from "app/jobs/queries/getJobUser"

type LayoutProps = {
  children: ReactNode
  job: ExtendedJob
}

const JobSettingsLayout = ({ job, children }: LayoutProps) => {
  const router = useRouter()
  const session = useSession()
  const [jobUser] = useQuery(getJobUser, {
    where: { userId: session.userId || "0", jobId: job?.id || "0" },
  })

  const subNavigation = [
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Details",
          href: `/jobs/${job?.slug}/settings`,
          current: router.route === `/jobs/[slug]/settings`,
          icon: CollectionIcon,
          canView: true,
        }
      : null,
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Members",
          href: `/jobs/${job?.slug}/settings/members`,
          current: router.route === `/jobs/[slug]/settings/members`,
          icon: UserGroupIcon,
          canView: true,
        }
      : null,
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
        {subNavigation.map((item) => {
          if (!item) return <></>

          return (
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
          )
        })}
      </div>
      <div className="space-y-6 w-full lg:w-4/5">
        <Suspense fallback="Loading">{children}</Suspense>
      </div>
    </div>
  )
}

export default JobSettingsLayout
