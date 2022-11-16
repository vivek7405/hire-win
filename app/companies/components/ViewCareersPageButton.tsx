import { ExternalLinkIcon } from "@heroicons/react/outline"
import { Link, Routes } from "blitz"

type ViewJobListingButtonPropsType = {
  companySlug: string
  noPadding?: boolean
}
const ViewCareersPageButton = ({ companySlug, noPadding }: ViewJobListingButtonPropsType) => (
  <Link prefetch={true} href={Routes.CareersPage({ companySlug })} passHref>
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`flex whitespace-nowrap items-center underline text-theme-600 ${
        noPadding ? "" : "py-2"
      } hover:text-theme-800`}
    >
      <span>View Careers Page</span>
      <ExternalLinkIcon className="w-4 h-4 ml-1" />
    </a>
  </Link>
)

export default ViewCareersPageButton
