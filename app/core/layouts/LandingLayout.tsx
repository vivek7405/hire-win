import { ReactNode, Suspense, useEffect } from "react"
import { Head, Link, Routes, useQuery, useSession } from "blitz"
import Navbar from "app/core/components/Navbar"
import { ExtendedUser } from "types"
import getCompanyUser from "app/companies/queries/getCompanyUser"
import LogoBrand from "app/assets/LogoBrand"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const LandingLayout = ({ title, children }: LayoutProps) => {
  var navMenuDiv = document.getElementById("nav-content")
  var navMenu = document.getElementById("nav-toggle")

  document.onclick = check
  function check(e) {
    var target = (e && e.target) || (event && event.srcElement)

    //Nav Menu
    if (!checkParent(target, navMenuDiv)) {
      // click NOT on the menu
      if (checkParent(target, navMenu)) {
        // click on the link
        if (navMenuDiv?.classList.contains("hidden")) {
          navMenuDiv?.classList.remove("hidden")
        } else {
          navMenuDiv?.classList.add("hidden")
        }
      } else {
        // click both outside link and outside menu, hide menu
        navMenuDiv?.classList.add("hidden")
      }
    }
  }
  function checkParent(t, elm) {
    while (t.parentNode) {
      if (t == elm) {
        return true
      }
      t = t.parentNode
    }
    return false
  }

  return (
    <>
      <Suspense fallback="Loading...">
        <Head>
          <title>{title || "hire-win"}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="px-6 md:px-0 lg:px-0 bg-gradient-to-r from-fuchsia-100 via-purple-200 to-indigo-200 leading-relaxed tracking-wide flex flex-col min-h-screen">
          <nav id="header" className="w-full z-30 top-0 py-1">
            <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
              <div className="w-44 h-10 lg:h-16 lg:w-72">
                <Link href={Routes.Home()}>
                  <a>
                    <LogoBrand logoProps={{ fill: "#4f46e5" }} brandProps={{ fill: "#4f46e5" }} />
                  </a>
                </Link>
              </div>

              <div className="block lg:hidden">
                <button
                  id="nav-toggle"
                  className="flex items-center px-3 py-2 border rounded text-neutral-700 border-neutral-600 hover:text-neutral-900 hover:border-fuchsia-600 appearance-none focus:outline-none"
                >
                  <svg
                    className="fill-current h-3 w-3"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                  </svg>
                </button>
              </div>

              <div
                id="nav-content"
                className="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 text-black p-4 lg:p-0 z-20"
              >
                <ul className="list-reset lg:flex justify-end flex-1 items-center">
                  <li className="mr-3">
                    <Link href={`${Routes.Home().pathname}/#screenshots`}>
                      <a className="inline-block cursor-pointer hover:underline font-semibold text-black no-underline hover:text-neutral-800 hover:text-underline py-2 px-4">
                        Screenshots
                      </a>
                    </Link>
                  </li>
                  <li className="mr-3">
                    <Link href={`${Routes.Home().pathname}/#pricing`}>
                      <a className="inline-block cursor-pointer hover:underline font-semibold text-black no-underline hover:text-neutral-800 hover:text-underline py-2 px-4">
                        Pricing
                      </a>
                    </Link>
                  </li>
                  <li className="mr-3">
                    <Link href={`${Routes.Home().pathname}/#reviews`}>
                      <a className="inline-block cursor-pointer hover:underline font-semibold py-2 px-4 text-black no-underline">
                        Reviews
                      </a>
                    </Link>
                  </li>
                </ul>
                <Link href={Routes.LoginPage()}>
                  <a>
                    <button
                      id="navAction"
                      className="bg-gradient-to-br from-fuchsia-500 to-indigo-600 mx-auto lg:mx-0 hover:underline text-white font-extrabold rounded mt-4 lg:mt-0 py-3 px-8 shadow opacity-75"
                    >
                      Login
                    </button>
                  </a>
                </Link>
              </div>
            </div>
          </nav>

          <div className="container mx-auto mb-auto h-full mt-3">{children}</div>

          <footer className="text-neutral-900">
            <div className="container mx-auto mt-8">
              <div className="w-full flex flex-col md:flex-row lg:flex-row py-6">
                <div className="flex-1 mb-6">
                  <Link href={Routes.Home()}>
                    <a className="text-orange-600 no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
                      #hireWIN
                    </a>
                  </Link>
                </div>

                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Links</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.FAQ()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          FAQ
                        </a>
                      </Link>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Help()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Help
                        </a>
                      </Link>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Support()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Support
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Legal</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Terms()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Terms
                        </a>
                      </Link>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Privacy()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Privacy
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Social</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Facebook
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Linkedin
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Twitter
                      </a>
                    </li>
                  </ul>
                </div> */}
                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Company</p>
                  <ul className="list-reset mb-6">
                    {/* <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Official Blog
                      </a>
                    </li> */}
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.AboutUs()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          About Us
                        </a>
                      </Link>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Contact()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Contact
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Suspense>
    </>
  )
}

export default LandingLayout
