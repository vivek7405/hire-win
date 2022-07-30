import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useMutation, Link, Routes, Image, useSession, useQuery } from "blitz"
import { CheckIcon, MenuIcon, XIcon } from "@heroicons/react/outline"
import { ExtendedUser } from "types"
import logout from "app/auth/mutations/logout"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Logo from "app/assets/Logo"
import getCompanyUser from "app/companies/queries/getCompanyUser"
import getCompanyUsers from "app/companies/queries/getCompanyUsers"
import Modal from "./Modal"
import CompanyForm from "app/companies/components/CompanyForm"
import { EditorState } from "draft-js"
import updateCompanySession from "app/companies/mutations/updateCompanySession"
import { CompanyUserRole, UserRole } from "@prisma/client"
import Confirm from "./Confirm"
import getCurrentPlan from "app/companies/queries/getCurrentPlan"
import canCreateNewCompany from "app/companies/queries/canCreateNewCompany"
import Guard from "app/guard/ability"

type NavbarProps = {
  user?: ExtendedUser | null
}

const NavbarContent = ({ user }: NavbarProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [companyOpenDesktop, setCompanyOpenDesktop] = useState(false)
  const [companyOpenMobileAndTablet, setCompanyOpenMobileAndTablet] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const session = useSession()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [companyUser] = useQuery(getCompanyUser, {
    where: { userId: session?.userId || "0", companyId: session?.companyId || "0" },
  })
  const [companyUsers] = useQuery(getCompanyUsers, {
    where: { userId: session?.userId || "0" },
  })
  const [canCreateCompany] = useQuery(canCreateNewCompany, null)

  const [selectedCompanyUser, setSelectedCompanyUser] = useState(companyUser)
  useEffect(() => {
    setSelectedCompanyUser(companyUser)
  }, [companyUser])

  const [logoutMutation] = useMutation(logout)

  const isOwnerOrAdmin =
    companyUser?.role === CompanyUserRole.OWNER || companyUser?.role === CompanyUserRole.ADMIN

  const nav = [
    {
      name: "Jobs",
      href: Routes.JobsHome().pathname,
      focus: router.route.includes(Routes.JobsHome().pathname),
    },
  ]
  if (isOwnerOrAdmin) {
    nav.push(
      {
        name: "Categories",
        href: Routes.CategoriesHome().pathname,
        focus: router.route.includes(Routes.CategoriesHome().pathname),
      },
      {
        name: "Workflows",
        href: Routes.WorkflowsHome().pathname,
        focus:
          router.route.includes(Routes.WorkflowsHome().pathname) ||
          router.route.includes(Routes.StagesHome().pathname),
      },
      {
        name: "Forms",
        href: Routes.FormsHome().pathname,
        focus:
          router.route.includes(Routes.FormsHome().pathname) ||
          router.route.includes(Routes.QuestionsHome().pathname),
      },
      {
        name: "Score Cards",
        href: Routes.ScoreCardsHome().pathname,
        focus:
          router.route.includes(Routes.ScoreCardsHome().pathname) ||
          router.route.includes(Routes.CardQuestionsHome().pathname),
      },
      {
        name: "Email Templates",
        href: Routes.EmailTemplatesHome().pathname,
        focus: router.route.includes(Routes.EmailTemplatesHome().pathname),
      },
      {
        name: "Candidate Pools",
        href: Routes.CandidatePoolsHome().pathname,
        focus: router.route.includes(Routes.CandidatePoolsHome().pathname),
      }
    )
  }

  let dropDownNav = [
    {
      name: "Settings",
      href: Routes.UserSettingsPage().pathname,
      focus: router.route === "/settings",
    },
    selectedCompanyUser?.role === CompanyUserRole.OWNER ||
    selectedCompanyUser?.role === CompanyUserRole.ADMIN
      ? {
          name: "Members",
          href: Routes.UserSettingsMembersPage().pathname,
          focus: router.route === Routes.UserSettingsMembersPage().pathname,
        }
      : null,
    {
      name: "Schedules",
      href: Routes.UserSettingsSchedulesPage().pathname,
      focus: router.route === "/settings/schedules",
    },
    {
      name: "Calendars",
      href: Routes.UserSettingsCalendarsPage().pathname,
      focus: router.route === Routes.UserSettingsCalendarsPage().pathname,
    },
    {
      name: "Sign Out",
      action: async () => {
        await router.push(Routes.LoginPage())
        await logoutMutation()
      },
      href: "",
    },
  ]
  user &&
    user.role === UserRole.ADMIN &&
    dropDownNav.push({
      name: "Admin",
      href: Routes.Admin().pathname,
      focus: router.route === Routes.Admin().pathname,
    })

  useEffect(() => {
    const closeDropdownsOnResize = () => {
      setMobileNavOpen(false)
      setProfileOpen(false)
    }
    window.addEventListener("resize", closeDropdownsOnResize)
    return () => window.removeEventListener("resize", closeDropdownsOnResize)
  }, [])

  const [updateCompanySessionMutation] = useMutation(updateCompanySession)

  const CompanySelectDropdown = ({ companyOpen, setCompanyOpen }) => (
    <DropdownMenu.Root modal={false} open={companyOpen} onOpenChange={setCompanyOpen}>
      <DropdownMenu.Trigger className="mr-6 bg-theme-700 flex items-center text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
        <div
          title={selectedCompanyUser?.company?.name}
          className="w-24 p-1 text-white font-semibold truncate"
        >
          {selectedCompanyUser?.company?.name}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
        <DropdownMenu.Arrow className="fill-current" offset={10} />
        <DropdownMenu.RadioGroup
          value={((selectedCompanyUser || companyUser)?.companyId || "0")?.toString()}
          onValueChange={async (companyId) => {
            const cu = companyUsers?.find(
              (cu) => cu.userId === user?.id && cu.companyId === companyId
            )
            setSelectedCompanyUser(cu!)
            await updateCompanySessionMutation(companyId || "0")
            router.pathname === Routes.JobsHome().pathname
              ? router.reload()
              : router.push(Routes.JobsHome())
          }}
        >
          {companyUsers?.map((cu) => {
            return (
              <div key={cu.companyId}>
                <DropdownMenu.RadioItem
                  value={cu.company?.id?.toString()}
                  className="text-left w-full rounded-md whitespace-nowrap cursor-pointer flex px-4 py-1 text-sm text-gray-700 hover:text-white hover:bg-theme-600 focus:outline-none focus-visible:text-white"
                >
                  <DropdownMenu.ItemIndicator className="flex items-center">
                    <CheckIcon className="w-4 h-4 absolute left-2" />
                  </DropdownMenu.ItemIndicator>
                  <p className="ml-2">
                    {cu.company?.name} (<span className="lowercase">{cu.role}</span>)
                  </p>
                </DropdownMenu.RadioItem>
              </div>
            )
          })}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <>
      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Upgrade all companies to the Pro Plan"
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
        hideConfirm={true}
        cancelText={"Ok"}
      >
        All existing companies should be on PRO plan to add a new company
      </Confirm>
      <nav className="bg-theme-600 py-2">
        <div className="max-w-7xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
          <Link prefetch={true} href={Routes.JobsHome()}>
            <a className="w-12 h-12">
              <Logo fill="white" strokeWidth={0.1} />
            </a>
          </Link>

          {companyUser && (
            <>
              <div className="lg:flex justify-between items-center w-full hidden">
                <div className="space-x-2 flex">
                  {nav.map((item, i) => {
                    return (
                      <Link prefetch={true} href={item.href} passHref key={i}>
                        <a
                          className={`${
                            item.focus
                              ? "text-white bg-theme-800"
                              : "text-neutral-50 hover:text-neutral-200"
                          } px-3 py-2 rounded-md text-sm font-medium`}
                        >
                          {item.name}
                        </a>
                      </Link>
                    )
                  })}
                </div>

                <div className="flex">
                  <CompanySelectDropdown
                    companyOpen={companyOpenDesktop}
                    setCompanyOpen={setCompanyOpenDesktop}
                  />

                  <DropdownMenu.Root modal={false} open={profileOpen} onOpenChange={setProfileOpen}>
                    <DropdownMenu.Trigger className="bg-theme-700 flex text-sm rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
                      <DropdownMenu.Arrow className="fill-current" offset={10} />
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault()
                          if (canCreateCompany) {
                            router.push(Routes.NewCompany())
                          } else {
                            setOpenConfirm(true)
                          }
                        }}
                        className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                      >
                        Add Company
                      </DropdownMenu.Item>
                      {dropDownNav.map((item, i) => {
                        if (!item) return <></>

                        return (
                          <DropdownMenu.Item
                            key={i}
                            data-testid={`${item.name}-navLink`}
                            onSelect={(e) => {
                              e.preventDefault()
                              item.href.length ? router.push(item.href) : item.action!()
                            }}
                            className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                          >
                            {item.name}
                          </DropdownMenu.Item>
                        )
                      })}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              <div className="flex lg:hidden items-center">
                <CompanySelectDropdown
                  companyOpen={companyOpenMobileAndTablet}
                  setCompanyOpen={setCompanyOpenMobileAndTablet}
                />
              </div>

              <div className="flex lg:hidden items-center">
                {mobileNavOpen ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileNavOpen(!mobileNavOpen)
                    }}
                  >
                    <XIcon className="h-6 w-6 text-white cursor-pointer" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileNavOpen(!mobileNavOpen)
                    }}
                    data-testid="openMobileMenu"
                  >
                    <MenuIcon className="h-6 w-6 text-white cursor-pointer" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {companyUser && mobileNavOpen && (
          <div className="p-5 flex flex-col lg:hidden">
            {nav.map((item, i) => {
              return (
                <Link prefetch={true} href={item.href} passHref key={i}>
                  <a
                    className={`${
                      item.focus
                        ? "text-white bg-theme-800"
                        : "text-neutral-50 hover:text-neutral-200"
                    } px-3 py-2 rounded-md text-sm font-medium w-full block`}
                  >
                    {item.name}
                  </a>
                </Link>
              )
            })}

            <div className="w-full h1 border border-theme-700 rounded-full mt-4 mb-2" />

            {dropDownNav.map((item, i) => {
              if (!item) return <></>

              return item.href.length ? (
                <Link prefetch={true} href={item.href} passHref key={i}>
                  <a
                    data-testid={`${item.name}-navLink`}
                    className={`px-4 py-2 text-sm text-neutral-50 hover:text-neutral-200`}
                  >
                    {item.name}
                  </a>
                </Link>
              ) : (
                <button
                  data-testid={`${item.name}-navLink`}
                  key={i}
                  onClick={async (e) => {
                    e.preventDefault()
                    item.action && item.action()
                  }}
                  className="px-4 py-2 text-left text-sm text-neutral-50 hover:text-neutral-200"
                >
                  {item.name}
                </button>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}

const Navbar = ({ user }) => {
  return (
    <>
      <Suspense
        fallback={
          <nav className="bg-theme-600 py-2">
            <div className="max-w-7xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
              <Link prefetch={true} href={Routes.JobsHome()}>
                <a className="w-12 h-12">
                  <Logo fill="white" strokeWidth={0.1} />
                </a>
              </Link>
            </div>
          </nav>
        }
      >
        <NavbarContent user={user} />
      </Suspense>
    </>
  )
}

export default Navbar
