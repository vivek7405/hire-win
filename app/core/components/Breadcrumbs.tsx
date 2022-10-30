import React from "react"
import { useRouter, Link, Routes } from "blitz"
import { HomeIcon } from "@heroicons/react/solid"
import { ChevronRightIcon } from "@heroicons/react/outline"

type BreadcrumbsProps = {
  ignore?: { breadcrumb: string | undefined; href: string }[]
}

export const Breadcrumbs = ({ ignore }: BreadcrumbsProps) => {
  const router = useRouter()
  const [breadcrumbs, setBreadcrumbs] = React.useState<
    { breadcrumb: string; href: string }[] | undefined
  >([])

  const buildBreadcrumbs = async () => {
    const linkPath = router.asPath.split("/")
    linkPath.shift()

    const pathArray = linkPath.map((path, i) => {
      return {
        breadcrumb: path.split("?")[0] as string,
        href: "/" + linkPath.slice(0, i + 1).join("/"),
      }
    })

    if (ignore && ignore.length) {
      const filtered = pathArray.filter((el) => {
        return !ignore.find((rm) => rm.href === el.href)
      })

      setBreadcrumbs(filtered)
    } else {
      setBreadcrumbs(pathArray)
    }
  }

  React.useEffect(() => {
    buildBreadcrumbs()
    return () => {
      buildBreadcrumbs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath])

  return (
    <ul className="flex items-center space-x-4 flex-wrap">
      <li>
        <Link href={Routes.JobsHome()} passHref>
          <a className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5 text-theme-500" aria-hidden="true" />
          </a>
        </Link>
      </li>
      {breadcrumbs?.map((breadcrumb, i) => {
        return (
          <li key={i}>
            {router.asPath === breadcrumb.href ? (
              <div className="flex items-center">
                {/* <svg className="text-gray-400 mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5858 6.34317L12 4.92896L19.0711 12L12 19.0711L10.5858 17.6569L16.2427 12L10.5858 6.34317Z"
                    fill="currentColor"
                  />
                </svg> */}
                <ChevronRightIcon className="text-gray-400 mr-2 w-4 h-4" />

                <span className="text-sm font-medium text-gray-800">
                  {decodeURIComponent(breadcrumb.breadcrumb)?.includes("@") ? (
                    decodeURIComponent(breadcrumb.breadcrumb)
                  ) : (
                    <span className="capitalize">{decodeURIComponent(breadcrumb.breadcrumb)}</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <ChevronRightIcon className="text-gray-400 mr-2 w-4 h-4" />
                <Link href={breadcrumb.href} passHref>
                  <a className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {decodeURIComponent(breadcrumb.breadcrumb)?.includes("@") ? (
                      decodeURIComponent(breadcrumb.breadcrumb)
                    ) : (
                      <span className="capitalize">
                        {decodeURIComponent(breadcrumb.breadcrumb)}
                      </span>
                    )}
                  </a>
                </Link>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Breadcrumbs
