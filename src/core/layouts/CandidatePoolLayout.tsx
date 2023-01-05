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
import getCandidatePools from "src/candidate-pools/queries/getCandidatePools"
import getCandidatePoolsWOPagination from "src/candidate-pools/queries/getCandidatePoolsWOPagination"

type LayoutProps = {
  children: ReactNode
}

const CandidatePoolLayout = ({ children }: LayoutProps) => {
  const router = useRouter()
  const session = useSession()

  const [candidatePools] = useQuery(getCandidatePoolsWOPagination, {
    where: { companyId: session.companyId || "0" },
  })

  //   const [companyUser] = useQuery(getCompanyUser, {
  //     where: { userId: session.userId || "0", companyId: session.companyId || "0" },
  //   })

  //   const [parentCompanyUser] = useQuery(getParentCompanyUser, {
  //     where: {
  //       userId: session.userId || "0",
  //       parentCompanyId: companyUser?.company?.parentCompanyId || "0",
  //     },
  //   })

  type SubNavigationType = {
    name: string
    href: string
    current: boolean
    count: number
  }
  const subNavigation: SubNavigationType[] = []

  candidatePools?.map((candidatePool) => {
    subNavigation.push({
      name: candidatePool?.name,
      href: Routes.SingleCandidatePoolPage({ slug: candidatePool?.slug }).pathname.replaceAll(
        "[slug]",
        candidatePool?.slug
      ),
      current:
        router.asPath ===
        Routes.SingleCandidatePoolPage({ slug: candidatePool?.slug }).pathname.replaceAll(
          "[slug]",
          candidatePool?.slug
        ),
      count: candidatePool?._count?.candidates,
    })
  })

  return (
    <div className="bg-gray-100 flex flex-col mt-6 md:flex-row md:space-x-4 lg:flex-row lg:space-x-4">
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
                    ? "bg-gray-50 text-theme-600 hover:bg-white"
                    : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
                } group px-3 py-2 flex items-center justify-between text-sm font-medium`}
              >
                <span className="truncate">{item.name}</span>
                <span className="ml-3">{item.count}</span>
              </a>
            </Link>
          )
        })}
      </div>
      <div className="w-full md:w-4/5 lg:w-4/5">{children}</div>
    </div>
  )
}

export default CandidatePoolLayout
