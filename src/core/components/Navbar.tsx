import Link from "next/link"
import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useState, useEffect, Suspense, useRef } from "react"
import {
  CheckIcon,
  MenuIcon,
  SparklesIcon,
  TicketIcon,
  XCircleIcon,
  XIcon,
  MinusCircleIcon,
  BadgeCheckIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@heroicons/react/outline"
import { IntroHint, IntroStep, SubscriptionStatus } from "types"
import logout from "src/auth/mutations/logout"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Logo from "src/assets/Logo"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import getCompanyUsers from "src/companies/queries/getCompanyUsers"
import updateCompanySession from "src/companies/mutations/updateCompanySession"
import { CompanyUserRole, ParentCompanyUserRole, UserRole } from "@prisma/client"
import Confirm from "./Confirm"
import canCreateNewCompany from "src/companies/queries/canCreateNewCompany"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import getParentCompanyUser from "src/parent-companies/queries/getParentCompanyUser"

type NavbarProps = {
  user?: Awaited<ReturnType<typeof getCurrentUserServer>> | null
  showEmptyNavbar?: boolean
  setNavbarIntroSteps?: (steps: IntroStep[]) => void
  setNavbarIntroHints?: (hints: IntroHint[]) => void
}

const NavbarContent = ({
  user,
  showEmptyNavbar,
  setNavbarIntroSteps,
  setNavbarIntroHints,
}: NavbarProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [companyOpenDesktop, setCompanyOpenDesktop] = useState(false)
  const [companyOpenMobileAndTablet, setCompanyOpenMobileAndTablet] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const session = useSession()
  // const [openConfirm, setOpenConfirm] = useState(false)
  const [companyUser] = useQuery(
    getCompanyUser,
    {
      where: { userId: session?.userId || "0", companyId: session?.companyId || "0" },
    },
    { refetchOnWindowFocus: false }
  )

  const [parentCompanyUser] = useQuery(
    getParentCompanyUser,
    {
      where: {
        parentCompanyId: companyUser?.company?.parentCompanyId || "0",
        userId: session?.userId || "0",
      },
    },
    { refetchOnWindowFocus: false }
  )

  // const [canCreateCompany] = useQuery(canCreateNewCompany, null)

  const [selectedCompanyUser, setSelectedCompanyUser] = useState(companyUser)
  useEffect(() => {
    setSelectedCompanyUser(companyUser)
  }, [companyUser])

  const [logoutMutation] = useMutation(logout)

  const isCompanyOwnerOrAdmin = companyUser?.role !== CompanyUserRole.USER

  const isParentCompanyOwnerOrAdmin =
    parentCompanyUser && parentCompanyUser?.role !== ParentCompanyUserRole.USER

  const nav = [
    {
      name: "Jobs",
      href: Routes.JobsHome().pathname,
      focus: router.route.includes(Routes.JobsHome().pathname),
      introStep: {
        element: "#selectorJobsMenuStep",
        title: "Jobs",
        intro: (
          <span>
            <p>
              {`You'll`} see <b>all your jobs</b> here.
            </p>
            <br />
            <p>
              All the <b>active jobs</b> will be <b>listed on careers page</b> unless hidden.
            </p>
            <br />
            <p>
              Once you start receiving applications from candidates or add them manually to a job,
              you can then <b>track them across your job workflow</b> (interviewing stages) and{" "}
              <b>schedule & conduct interviews with your team</b>
            </p>
          </span>
        ),
      } as IntroStep,
    },
  ]

  if (isCompanyOwnerOrAdmin) {
    nav.push({
      name: "Categories",
      href: Routes.CategoriesHome().pathname,
      focus: router.route.includes(Routes.CategoriesHome().pathname),
      introStep: {
        element: "#selectorCategoriesMenuStep",
        title: "Categories",
        intro: (
          <span>
            <p>
              Categories are broadly the <b>departments in your company</b>, like IT, Marketing,
              Engineering, etc.
            </p>
            <br />
            <p>
              The jobs are <b>listed by category</b> on careers page.
            </p>
            <br />
            <p>
              Candidates can <b>filter</b> the job openings <b>by categories</b>.
            </p>
          </span>
        ),
      },
    })
  }

  if (isCompanyOwnerOrAdmin || isParentCompanyOwnerOrAdmin) {
    nav.push(
      {
        name: "Email Templates",
        href: Routes.EmailTemplatesHome().pathname,
        focus: router.route.includes(Routes.EmailTemplatesHome().pathname),
        introStep: {
          element: "#selectorEmailTemplatesMenuStep",
          title: "Email Templates",
          intro: (
            <span>
              <p>
                Email templates make it easier to shoot a <b>quick email to candidates</b>.
              </p>
              <br />
              <p>
                Create <b>email templates with placeholders</b> like candidate name, sender name,
                interview stage, etc. which shall be{" "}
                <b>replaced by actual values while sending email to the candidate</b>.
              </p>
            </span>
          ),
        },
      },
      {
        name: "Candidate Pools",
        href: Routes.CandidatePoolsHome().pathname,
        focus: router.route.includes(Routes.CandidatePoolsHome().pathname),
        introStep: {
          element: "#selectorCandidatePoolsMenuStep",
          title: "Candidate Pools",
          intro: (
            <span>
              <p>
                Consider candidate pool as a <b>folder of candidates</b>.
              </p>
              <br />
              <p>
                You may create multiple pools and <b>add candidates to them for your record</b>.
              </p>
            </span>
          ),
        },
      }
    )
  }

  let dropDownNav = [
    {
      name: "Settings",
      href:
        selectedCompanyUser?.role === CompanyUserRole.OWNER ||
        selectedCompanyUser?.role === CompanyUserRole.ADMIN
          ? Routes.UserSettingsCompanyPage().pathname
          : Routes.UserSettingsProfilePage().pathname,
      focus:
        selectedCompanyUser?.role === CompanyUserRole.OWNER ||
        selectedCompanyUser?.role === CompanyUserRole.ADMIN
          ? router.route === Routes.UserSettingsCompanyPage().pathname
          : router.route === Routes.UserSettingsProfilePage().pathname,
    },
    // selectedCompanyUser?.role === CompanyUserRole.OWNER ||
    // selectedCompanyUser?.role === CompanyUserRole.ADMIN
    //   ? {
    //       name: "Members",
    //       href: Routes.UserSettingsMembersPage().pathname,
    //       focus: router.route === Routes.UserSettingsMembersPage().pathname,
    //     }
    //   : null,
    // {
    //   name: "Availabilities",
    //   href: Routes.UserSettingsAvailabilitiesPage().pathname,
    //   focus: router.route === "/settings/availabilities",
    // },
    // {
    //   name: "Calendars",
    //   href: Routes.UserSettingsCalendarsPage().pathname,
    //   focus: router.route === Routes.UserSettingsCalendarsPage().pathname,
    // },
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
      href: Routes.AdminHomePage().pathname,
      focus: router.route === Routes.AdminHomePage().pathname,
    })

  const [width, setWidth] = useState(window.innerWidth)
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth)
    setMobileNavOpen(false)
    setProfileOpen(false)
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange)
    return () => window.removeEventListener("resize", handleWindowSizeChange)
  }, [])

  const [updateCompanySessionMutation] = useMutation(updateCompanySession)

  const CompanySelectDropdown = ({ companyOpen, setCompanyOpen }) => {
    const [companyUsers] = useQuery(
      getCompanyUsers,
      {
        where: { userId: session?.userId || "0" },
      },
      { refetchOnWindowFocus: false }
    )

    const [filteredCompanyUsers, setFilteredCompanyUsers] = useState(companyUsers)
    const searchInput = useRef(null)

    useEffect(() => {
      ;(searchInput as any)?.current?.focus()
    }, [filteredCompanyUsers])

    return (
      <div className="flex items-center space-x-2">
        <DropdownMenu.Root modal={false} open={companyOpen} onOpenChange={setCompanyOpen}>
          <DropdownMenu.Trigger className="bg-theme-600 hover:bg-theme-700 flex items-center text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
            <div
              title={selectedCompanyUser?.company?.name}
              className="w-24 py-1 px-2 text-white font-semibold truncate"
            >
              {selectedCompanyUser?.company?.name}
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded">
              <DropdownMenu.Arrow className="fill-current" />
              <DropdownMenu.RadioGroup
                value={((selectedCompanyUser || companyUser)?.companyId || "0")?.toString()}
                onValueChange={async (companyId) => {
                  if (companyId === "new_company") {
                    router.push(Routes.NewCompany())
                  } else {
                    const cu = filteredCompanyUsers?.find(
                      (cu) => cu.userId === user?.id && cu.companyId === companyId
                    )
                    setSelectedCompanyUser(cu!)
                    await updateCompanySessionMutation(companyId || "0")
                    router.pathname === Routes.JobsHome().pathname
                      ? router.reload()
                      : router.push(Routes.JobsHome())
                  }
                }}
              >
                <div className="w-full p-2 flex items-center">
                  <input
                    ref={searchInput}
                    autoFocus={true}
                    type="text"
                    placeholder="Search Company..."
                    className="w-full h-8 border rounded border-neutral-400 text-neutral-700 text-sm"
                    onChange={(e) => {
                      const searchString = e.target.value

                      if (searchString?.trim()) {
                        setFilteredCompanyUsers(
                          companyUsers?.filter((cu) =>
                            cu.company?.name
                              ?.toLowerCase()
                              ?.trim()
                              ?.includes(searchString?.toLowerCase()?.trim())
                          )
                        )
                      } else {
                        setFilteredCompanyUsers([...companyUsers])
                      }

                      setTimeout(() => {
                        ;(searchInput as any)?.current?.focus()
                      })
                    }}
                  />
                  <button
                    className="text-theme-600 hover:text-theme-800 -ml-7"
                    title="Add New Company"
                    onClick={() => {
                      router.push(Routes.NewCompany())
                    }}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                {filteredCompanyUsers?.length === 0 && (
                  <DropdownMenu.Item
                    disabled={true}
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                    className="opacity-50 cursor-not-allowed text-left w-full whitespace-nowrap block px-4 py-2 text-sm text-gray-700 focus:outline-none focus-visible:text-gray-900"
                  >
                    No companies available
                  </DropdownMenu.Item>
                )}
                {filteredCompanyUsers?.map((cu) => {
                  return (
                    <div key={cu.companyId}>
                      <DropdownMenu.RadioItem
                        value={cu.company?.id?.toString()}
                        className="text-left w-full rounded-md whitespace-nowrap cursor-pointer flex px-4 py-1 text-sm text-gray-700 hover:text-white hover:bg-theme-600 focus:outline-none focus-visible:text-white"
                      >
                        <DropdownMenu.ItemIndicator className="flex items-center">
                          <CheckIcon className="w-4 h-4 absolute left-2" />
                        </DropdownMenu.ItemIndicator>
                        <div className="ml-2 flex flex-nowrap space-x-1 items-center">
                          {/* <div className="flex">
                          {cu.subscription && <BadgeCheckIcon width={18} height={18} />}
                          {!cu.subscription && <MinusCircleIcon width={18} height={18} />}
                        </div> */}
                          <div>{cu.company?.name}</div>
                          <div className="lowercase">({cu.role})</div>
                        </div>
                      </DropdownMenu.RadioItem>
                    </div>
                  )
                })}
                <DropdownMenu.RadioItem
                  value="new_company"
                  className="text-left w-full rounded-md whitespace-nowrap cursor-pointer flex px-4 py-1 text-sm text-gray-700 hover:text-white hover:bg-theme-600 focus:outline-none focus-visible:text-white"
                >
                  <div className="ml-2 flex flex-nowrap space-x-1 items-center">
                    <PlusIcon className="w-4 h-4 absolute left-2" />
                    <div>Add New Company</div>
                  </div>
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    )
  }

  const companyAndUserMenuIntro = [
    {
      element: "#selectorCompanyMenuStep",
      title: "Company",
      intro: (
        <span>
          <p>
            You may have multiple companies, some where you are the owner and some where {`you're`}{" "}
            invited as an admin or an interviewer, so this is where you can{" "}
            <b>switch between your companies</b>.
          </p>
          <br />
          <p>
            Note that <b>company acts as a workspace</b> and everything that you see is specific to
            the currently selected company apart from your personal info, schedules and work
            calendars which are specific to you and not to the company.
          </p>
        </span>
      ),
    },
    {
      element: "#selectorUserMenuStep",
      title: "User & Company Settings",
      intro: (
        <span>
          <p>
            Access <b>menu items specific to you and the currently selected company</b> from here.
          </p>
          <br />
          <p>
            <b>User specific menu items</b> like Personal info, Interviewing schedules and Work
            calendars can be accessed from here.
          </p>
          <br />
          <p>
            <b>Company specific menu items for the selected company</b> can also be accessed from
            here like Company info, Careers page theme, Members, Billing, etc.
          </p>
        </span>
      ),
    },
  ] as IntroStep[]
  useEffect(() => {
    setNavbarIntroSteps &&
      setNavbarIntroSteps([...nav.map((n) => n.introStep), ...companyAndUserMenuIntro])
    setNavbarIntroHints &&
      setNavbarIntroHints([
        {
          element: ".selectorUserMenuHint",
          hint: "Make sure you update company info and add your work calendar",
          hintPosition: "middle-middle",
        },
      ])
  }, [])

  return (
    <>
      {/* <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Upgrade all companies to the Recruiter Plan"
        onSuccess={async () => {
          router.push(Routes.UserSettingsBillingPage())
        }}
        hideConfirm={true}
        cancelText={"Ok"}
      >
        All existing companies should be on Recruiter plan to add a new company
      </Confirm> */}

      <nav className="m-4 py-2 text-black rounded-xl lg:rounded-full border border-black">
        <div className="max-w-8xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
          <span className="flex">
            {!(companyUser && !showEmptyNavbar) ? (
              <div className="w-12 h-12">{hireWinSVG}</div>
            ) : (
              <Link prefetch={true} href={Routes.JobsHome()} legacyBehavior>
                <a className="w-12 h-12">{hireWinSVG}</a>
              </Link>
            )}
            {/* <span className="text-xs">
              <Link legacyBehavior href={Routes.Beta()}>
                <a className="text-neutral-200 hover:underline">BETA</a>
              </Link>
            </span> */}
          </span>

          {companyUser && !showEmptyNavbar && (
            <>
              <div className="lg:flex justify-between items-center w-full hidden">
                <div className="space-x-2 flex">
                  {nav.map((item, i) => {
                    return (
                      <div
                        key={i}
                        id={
                          width >= 1024
                            ? item.introStep.element.replace("#", "")
                            : item.introStep.element
                        }
                      >
                        <Link prefetch={true} href={item.href} passHref legacyBehavior>
                          <a
                            className={`${
                              item.focus ? "text-white bg-theme-700" : "text-black"
                            } px-3 py-2 rounded-md text-sm font-medium hover:bg-theme-600 hover:text-white`}
                          >
                            {item.name}
                          </a>
                        </Link>
                      </div>
                    )
                  })}
                </div>

                <div className="flex">
                  <div
                    id={width >= 1024 ? "selectorCompanyMenuStep" : "#selectorCompanyMenuStep"}
                    className="mr-6 flex items-center justify-center"
                  >
                    <Suspense fallback="">
                      <CompanySelectDropdown
                        companyOpen={companyOpenDesktop}
                        setCompanyOpen={setCompanyOpenDesktop}
                      />
                    </Suspense>
                  </div>

                  <DropdownMenu.Root modal={false} open={profileOpen} onOpenChange={setProfileOpen}>
                    <DropdownMenu.Trigger className="bg-neutral-600 flex text-sm rounded-full text-gray-700 focus:outline-none focus:ring focus:ring-offset focus:ring-offset-neutral-600 focus:ring-white">
                      <div
                        id={width >= 1024 ? "selectorUserMenuStep" : "#selectorUserMenuStep"}
                        title={`${user?.name} - ${user?.email}`}
                        className="selectorUserMenuHint flex items-center justify-center h-8 w-8 rounded-full bg-white hover:bg-gray-100 border-black border-2"
                      >
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="w-auto bg-white text-white p-1 shadow-md rounded">
                        <DropdownMenu.Arrow className="fill-current" />
                        {/* <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault()
                          // if (canCreateCompany) {
                          router.push(Routes.NewCompany())
                          // } else {
                          //   setOpenConfirm(true)
                          // }
                        }}
                        className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:text-gray-900"
                      >
                        Add Company
                      </DropdownMenu.Item> */}
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
                              className="text-left w-full whitespace-nowrap cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:text-gray-900"
                            >
                              {item.name}
                            </DropdownMenu.Item>
                          )
                        })}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>

              <div className="flex lg:hidden items-center">
                <Suspense fallback="">
                  <CompanySelectDropdown
                    companyOpen={companyOpenMobileAndTablet}
                    setCompanyOpen={setCompanyOpenMobileAndTablet}
                  />
                </Suspense>
              </div>

              <div className="flex lg:hidden items-center">
                {mobileNavOpen ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileNavOpen(!mobileNavOpen)
                    }}
                  >
                    <XIcon className="h-6 w-6 text-black cursor-pointer" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setMobileNavOpen(!mobileNavOpen)
                    }}
                    data-testid="openMobileMenu"
                  >
                    <MenuIcon className="h-6 w-6 text-black cursor-pointer" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {companyUser && !showEmptyNavbar && mobileNavOpen && (
          <div className="p-5 flex flex-col lg:hidden">
            {nav.map((item, i) => {
              return (
                <Link prefetch={true} href={item.href} passHref key={i} legacyBehavior>
                  <a
                    className={`${
                      item.focus
                        ? "text-white bg-theme-600"
                        : "text-neutral-700 hover:bg-theme-500 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium w-full block`}
                  >
                    {item.name}
                  </a>
                </Link>
              )
            })}

            <div className="w-full h1 border border-theme-600 rounded-full mt-4 mb-2" />

            {/* <div
              onSelect={(e) => {
                e.preventDefault()
                // if (canCreateCompany) {
                router.push(Routes.NewCompany())
                // } else {
                //   setOpenConfirm(true)
                // }
              }}
              className={`cursor-pointer px-4 py-2 text-sm text-neutral-50 hover:text-neutral-200`}
            >
              Add Company
            </div> */}
            {/* <Link prefetch={true} href={Routes.NewCompany().pathname} passHref legacyBehavior>
              <a
                className={`${
                  router.route === Routes.NewCompany().pathname
                    ? "text-white bg-theme-800"
                    : "text-neutral-50 hover:text-neutral-200"
                } px-3 py-2 rounded-md text-sm font-medium`}
              >
                Add Company
              </a>
            </Link> */}
            {dropDownNav.map((item, i) => {
              if (!item) return <></>

              return item.href.length ? (
                <Link prefetch={true} href={item.href} passHref key={i} legacyBehavior>
                  <a
                    data-testid={`${item.name}-navLink`}
                    className={`${
                      router.route === item.href
                        ? "text-white bg-theme-600"
                        : "text-neutral-700 hover:bg-theme-500 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium`}
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
                  className={`${
                    router.route === item.href
                      ? "text-white bg-theme-600"
                      : "text-neutral-700 hover:bg-theme-500 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium text-left`}
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

const hireWinSVG = (
  <svg viewBox="110 -10 320 320" xmlns="http://www.w3.org/2000/svg">
    <g
      strokeLinecap="round"
      fill="black"
      // fill="#4f46e5"
      // transform="matrix(1, 0, 0, 1, -29.885393, 96.211571)"
    >
      <path d="M178.3,117.9c-1.9,0-3.8,0.1-5.7,0.4c-6.8,0.9-13.2,3.4-18.7,7.3c7.2,0.8,14,2.3,20.7,4.3 c-15.7,1.9-27.8,15.3-27.8,31.4c0,17.5,14.2,31.6,31.6,31.6s31.6-14.2,31.6-31.6c0-6-1.7-11.6-4.6-16.4c5.2,3.4,10.2,7.3,15.2,11.7 c-0.2-2.9-0.8-5.8-1.6-8.6c-1.8-6-4.8-11.4-9-16C202,123.1,190.4,117.9,178.3,117.9z M189.9,150.1c-5.4,0-9.8-4.4-9.8-9.8 c0-5.4,4.4-9.8,9.8-9.8s9.8,4.4,9.8,9.8C199.8,145.7,195.4,150.1,189.9,150.1z" />

      <path d="M261.7,195.5c0,0-8.8,20.2-32.7,36.2l32.7,45.9l32.7-45.9C270.5,215.8,261.7,195.5,261.7,195.5z" />

      <path d="M423.9,154.2c0-21.8-9.3-41.4-24-55.2c-8-0.4-16.7-0.3-25.9,0.7l0,0c0,0,0,0-0.1,0c-0.9,0.1-1.8,0.2-2.7,0.3 c-59.7,7-98.7,47.4-98.7,47.4c0,4.4,0.3,8.7,0.8,13.2l0,0c0.2,2.8,0.7,5.6,1.2,8.3c0,0.1,0,0.3,0,0.4l0,0 c7,34.4,37.4,60.3,73.9,60.3C390.1,229.5,423.9,195.8,423.9,154.2z M326,123.3c5.4,0,9.8,4.4,9.8,9.8c0,5.4-4.4,9.8-9.8,9.8 s-9.8-4.4-9.8-9.8C316.1,127.7,320.5,123.3,326,123.3z M337.9,207.7c-27.1-2.7-48.2-24.1-51-50.6c7.7-7.4,15.5-13.9,23.5-19.3 c-2.9,4.8-4.6,10.4-4.6,16.4c0,17.5,14.2,31.6,31.6,31.6c17.5,0,31.6-14.2,31.6-31.6c0-16.2-12.1-29.5-27.8-31.4 c15-4.7,31.1-6.2,49.1-4.4c7.7,11.1,11.3,24.5,9.9,38.2C397.2,187.9,369.3,210.8,337.9,207.7z" />

      <path d="M226.7,79c0.3,1.3,0.7,2.6,1.3,3.7l-3.9,5.2l-8.7,12c-30.2-17.8-69.7-10.2-90.8,18.6 c-12.1,16.5-15.8,36.7-11.9,55.3c1.5,7.3,4.3,14.5,8.1,21c4.6,7.8,10.8,14.7,18.5,20.4c30.7,22.6,74.1,16,96.7-14.7 c12.1-16.5,15.8-36.6,11.9-55.2c-2.7-12.7-9-24.8-18.6-34.5c-0.9-0.9-1.8-1.7-2.7-2.6l2-2.7L239.2,91c5.5,0.9,11.3-1.3,14.8-6 l31.4-42.6c2.7-3.7,3.5-8.1,2.7-12.3c-0.7-3.6-2.7-6.9-5.9-9.2c-6.8-5-16.5-3.6-21.5,3.3l-31.3,42.6C226.6,70.5,225.8,75,226.7,79z M229.6,141.9c0.8,2.2,1.4,4.5,1.9,6.8c3,14.1,0.1,29.4-9,41.8c-4.7,6.4-10.6,11.4-17.1,14.9c-4.3,2.4-8.9,4.1-13.7,5.2 c-1.4,0.3-2.8,0.6-4.2,0.7c-13.1,1.9-26.8-1.2-38.3-9.6c-10.8-7.9-17.6-19.3-20.2-31.4c-1.5-7.2-1.5-14.7,0-22 c1.5-7,4.5-13.8,9-19.9c17.1-23.3,50-28.3,73.3-11.2c0.3,0.2,0.5,0.4,0.8,0.6C220.4,124.3,226.3,132.7,229.6,141.9z" />
    </g>
  </svg>
)

const Navbar = ({
  user,
  showEmptyNavbar,
  setNavbarIntroSteps,
  setNavbarIntroHints,
}: NavbarProps) => {
  return (
    <>
      <Suspense
        fallback={
          <nav className="m-4 py-2 text-black rounded-xl lg:rounded-full border border-black">
            <div className="max-w-8xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
              <div className="w-12 h-12">{hireWinSVG}</div>
            </div>
          </nav>
        }
      >
        <NavbarContent
          user={user}
          showEmptyNavbar={showEmptyNavbar}
          setNavbarIntroSteps={setNavbarIntroSteps}
          setNavbarIntroHints={setNavbarIntroHints}
        />
      </Suspense>
    </>
  )
}

export default Navbar
