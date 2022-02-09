import { useState, useEffect, useCallback } from "react"
import { useRouter, useMutation, Link, Routes, Image } from "blitz"
import { MenuIcon, XIcon } from "@heroicons/react/outline"
import { ExtendedUser } from "types"
import logout from "app/auth/mutations/logout"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import transparentLogoWhite from "app/assets/logo_transparent_white.png"

type NavbarProps = {
  user?: ExtendedUser | null
}

const Navbar = ({ user }: NavbarProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)
  const nav = [
    { name: "Jobs", href: "/", current: router.route === "/" },
    { name: "Categories", href: "/categories", current: router.route === "/categories" },
    { name: "Stages", href: "/stages", current: router.route === "/stages" },
    { name: "Workflows", href: "/workflows", current: router.route === "/workflows" },
    { name: "Questions", href: "/questions", current: router.route === "/questions" },
    { name: "Forms", href: "/forms", current: router.route === "/forms" },
  ]
  let dropDownNav = [
    { name: "Settings", href: Routes.Settings().pathname, current: router.route === "/settings" },
    {
      name: "Sign Out",
      action: async () => {
        await router.push("/login")
        await logoutMutation()
      },
      href: "",
    },
  ]

  user &&
    user.role === "ADMIN" &&
    dropDownNav.push({
      name: "Admin",
      href: Routes.Admin().pathname,
      current: router.route === "/admin",
    })

  useEffect(() => {
    const closeDropdownsOnResize = () => {
      setMobileNavOpen(false)
      setProfileOpen(false)
    }
    window.addEventListener("resize", closeDropdownsOnResize)
    return () => window.removeEventListener("resize", closeDropdownsOnResize)
  }, [])

  return (
    <nav className="bg-theme-600 py-2">
      <div className="max-w-7xl px-4 lg:px-6 mx-auto flex space-x-6 justify-between">
        {/* <img className="h-12 w-auto" src="/logo.svg" alt="hire-win Logo" /> */}
        <a className="h-12 w-auto cursor-pointer">
          <Link href={Routes.Home()}>
            <span>
              <Image alt="hire.win" src={transparentLogoWhite} height="50" width="50" />
            </span>
          </Link>
        </a>

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

          <DropdownMenu.Root modal={false} open={profileOpen} onOpenChange={setProfileOpen}>
            <DropdownMenu.Trigger className="bg-theme-700 flex text-sm rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-700 focus:ring-white">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                {user?.email.charAt(0).toUpperCase()}
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="w-48 bg-white text-white p-1 shadow-md rounded top-1 absolute w-auto">
              <DropdownMenu.Arrow className="fill-current" offset={10} />
              {dropDownNav.map((item, i) => {
                return (
                  <DropdownMenu.Item
                    key={i}
                    data-testid={`${item.name}-navLink`}
                    onSelect={(e) => {
                      e.preventDefault()
                      item.href.length ? router.push(item.href) : item.action!()
                    }}
                    className={`${
                      !item.href.length && "text-left w-full"
                    } cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:text-gray-500 focus:outline-none focus-visible:text-gray-500`}
                  >
                    {item.name}
                  </DropdownMenu.Item>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
  )
}
export default Navbar
