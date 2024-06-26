import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { useSession } from "@blitzjs/auth"
import { useRouter } from "next/router"
import React, { ReactNode, Suspense } from "react"
import {
  ClockIcon,
  CollectionIcon,
  DatabaseIcon,
  DocumentTextIcon,
  HomeIcon,
  IdentificationIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/outline"
import { ExtendedJob } from "types"
import { JobUserRole } from "@prisma/client"
import getJobUser from "src/jobs/queries/getJobUser"
import JobSettingsBreadcrumbs from "src/jobs/components/JobSettingsBreadcrumbs"

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
          name: "Job Details",
          href: `/jobs/${job?.slug}/settings`,
          current: router.route === `/jobs/[slug]/settings`,
          icon: DatabaseIcon,
          canView: true,
        }
      : null,
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Job Description",
          href: `/jobs/${job?.slug}/settings/job-description`,
          current: router.route === `/jobs/[slug]/settings/job-description`,
          icon: DocumentTextIcon,
          canView: true,
        }
      : null,
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Application Form",
          href: `/jobs/${job?.slug}/settings/application-form`,
          current: router.route === `/jobs/[slug]/settings/application-form`,
          icon: IdentificationIcon,
          canView: true,
        }
      : null,
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Hiring Stages",
          href: `/jobs/${job?.slug}/settings/stages`,
          current:
            router.route === `/jobs/[slug]/settings/stages` ||
            router.route.includes(`/jobs/[slug]/settings/stages/[stageSlug]`),
          icon: CollectionIcon,
          canView: true,
        }
      : null,
    // jobUser?.role !== JobUserRole.USER
    //   ? {
    //       name: "Score Cards",
    //       href: `/jobs/${job?.slug}/settings/score-cards`,
    //       current: router.route.includes(`/jobs/[slug]/settings/score-cards`),
    //       icon: StarIcon,
    //       canView: true,
    //     }
    //   : null,
    jobUser?.role !== JobUserRole.USER
      ? {
          name: "Hiring Team",
          href: `/jobs/${job?.slug}/settings/hiring-team`,
          current: router.route === `/jobs/[slug]/settings/hiring-team`,
          icon: UserGroupIcon,
          canView: true,
        }
      : null,
    // {
    //   name: "Scheduling",
    //   href: `/jobs/${job?.slug}/settings/scheduling`,
    //   current: router.route === `/jobs/[slug]/settings/scheduling`,
    //   icon: ClockIcon,
    //   canView: true,
    // },
    // {
    //   name: "API Keys",
    //   href: `/jobs/${job?.slug}/settings/keys`,
    //   current: router.route === `/jobs/[slug]/settings/keys`,
    //   icon: KeyIcon,
    //   canView: true,
    // },
  ]

  return (
    <div className="bg-white">
      <JobSettingsBreadcrumbs job={job!} />
      <div className="flex flex-col lg:flex-row mt-6 lg:space-x-4">
        <div className="mb-6 lg:mb-0 w-full lg:w-1/5">
          {subNavigation.map((item) => {
            if (!item) return <></>

            return (
              item.canView && (
                <Link
                  replace={true}
                  prefetch={true}
                  href={item.href}
                  passHref
                  key={item.name}
                  legacyBehavior
                >
                  <a
                    data-testid={`${item.name}-jobSettingsLink`}
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
            )
          })}
        </div>
        <div className="space-y-6 w-full lg:w-4/5">
          <Suspense fallback="Loading">{children}</Suspense>
        </div>
      </div>
    </div>
  )
}

export default JobSettingsLayout
