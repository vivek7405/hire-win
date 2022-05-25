import { useState, useEffect, useCallback } from "react"
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

type NavbarProps = {
  user?: ExtendedUser | null
}

const Navbar = ({ user }: NavbarProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const session = useSession()
  const [companyUser] = useQuery(getCompanyUser, {
    where: { userId: session?.userId || 0, companyId: session?.companyId || 0 },
  })
  const [companyUsers] = useQuery(getCompanyUsers, {
    where: { userId: session?.userId || 0 },
  })

  const [selectedCompanyUser, setSelectedCompanyUser] = useState(companyUser)
  useEffect(() => {
    setSelectedCompanyUser(companyUser)
  }, [companyUser])

  const [logoutMutation] = useMutation(logout)
  const nav = [
    {
      name: "Jobs",
      href: Routes.JobsHome().pathname,
      current: router.route === Routes.JobsHome().pathname,
    },
    {
      name: "Categories",
      href: Routes.CategoriesHome().pathname,
      current: router.route === Routes.CategoriesHome().pathname,
    },
    {
      name: "Workflows",
      href: Routes.WorkflowsHome().pathname,
      current: router.route === Routes.WorkflowsHome().pathname,
    },
    {
      name: "Forms",
      href: Routes.FormsHome().pathname,
      current: router.route === Routes.FormsHome().pathname,
    },
    {
      name: "Score Cards",
      href: Routes.ScoreCardsHome().pathname,
      current: router.route === Routes.ScoreCardsHome().pathname,
    },
    {
      name: "Email Templates",
      href: Routes.EmailTemplatesHome().pathname,
      current: router.route === Routes.EmailTemplatesHome().pathname,
    },
    {
      name: "Candidate Pools",
      href: Routes.CandidatePoolsHome().pathname,
      current: router.route === Routes.CandidatePoolsHome().pathname,
    },
  ]
  let dropDownNav = [
    {
      name: "Settings",
      href: Routes.UserSettingsPage().pathname,
      current: router.route === "/settings",
    },
    {
      name: "Schedules",
      href: Routes.UserSettingsSchedulesPage().pathname,
      current: router.route === "/settings/schedules",
    },
    {
      name: "Calendars",
      href: Routes.UserSettingsCalendarsPage().pathname,
      current: router.route === Routes.UserSettingsCalendarsPage().pathname,
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

  // user &&
  //   user.role === "ADMIN" &&
  //   dropDownNav.push({
  //     name: "Admin",
  //     href: Routes.Admin().pathname,
  //     current: router.route === Routes.Admin().pathname,
  //   })

  useEffect(() => {
    const closeDropdownsOnResize = () => {
      setMobileNavOpen(false)
      setProfileOpen(false)
    }
    window.addEventListener("resize", closeDropdownsOnResize)
    return () => window.removeEventListener("resize", closeDropdownsOnResize)
  }, [])

  const [updateCompanySessionMutation] = useMutation(updateCompanySession)

  return (
    <>
      <nav className="bg-theme-600 py-2">
        <div className="max-w-7xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
          <Link href={Routes.JobsHome()}>
            <a className="w-12 h-12">
              <Logo fill="white" strokeWidth={0.1} />
            </a>
          </Link>

          <div className="lg:flex justify-between items-center w-full hidden">
            <div className="space-x-2 flex">
              {nav.map((item, i) => {
                return (
                  <Link href={item.href} passHref key={i}>
                    <a
                      className={`${
                        item.current
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
              <DropdownMenu.Root modal={false} open={companyOpen} onOpenChange={setCompanyOpen}>
                <DropdownMenu.Trigger className="mr-6 bg-theme-700 flex items-center text-sm rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
                  <div className="w-24 p-1 text-white truncate">
                    {selectedCompanyUser?.company?.name}
                  </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
                  <DropdownMenu.Arrow className="fill-current" offset={10} />
                  <DropdownMenu.RadioGroup
                    value={((selectedCompanyUser || companyUser)?.companyId || 0)?.toString()}
                    onValueChange={async (companyId) => {
                      const cu = companyUsers?.find(
                        (cu) => cu.userId === user?.id && cu.companyId === parseInt(companyId)
                      )
                      setSelectedCompanyUser(cu!)
                      await updateCompanySessionMutation(parseInt(companyId || "0"))
                      router.push(Routes.JobsHome())
                      // router.reload()
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

                {/* <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
                <DropdownMenu.Arrow className="fill-current" offset={10} />
                {companyUsers.map((companyUser, i) => {
                  return (
                    <DropdownMenu.Item
                      key={i}
                      data-testid={`${companyUser?.company?.name}-navLink`}
                      onSelect={(e) => {
                        e.preventDefault()
                        // item.href.length ? router.push(item.href) : item.action!()
                      }}
                      className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                    >
                      {companyUser?.company?.name}
                    </DropdownMenu.Item>
                  )
                })}
              </DropdownMenu.Content> */}
              </DropdownMenu.Root>

              <DropdownMenu.Root modal={false} open={profileOpen} onOpenChange={setProfileOpen}>
                <DropdownMenu.Trigger className="bg-theme-700 flex text-sm rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                    {user?.email.charAt(0).toUpperCase()}
                  </div>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded top-1 absolute">
                  <DropdownMenu.Arrow className="fill-current" offset={10} />
                  <DropdownMenu.Item
                    onSelect={(e) => {
                      e.preventDefault()
                      router.push(Routes.NewCompany())
                    }}
                    className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500"
                  >
                    Add Company
                  </DropdownMenu.Item>
                  {dropDownNav.map((item, i) => {
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
        </div>
        {/* Mobile Nav */}
        {mobileNavOpen && (
          <div className="p-5 flex flex-col lg:hidden">
            {nav.map((item, i) => {
              return (
                <Link href={item.href} passHref key={i}>
                  <a
                    className={`${
                      item.current
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
              return item.href.length ? (
                <Link href={item.href} passHref key={i}>
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
export default Navbar
