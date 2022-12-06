import Link from "next/link";
import { Routes } from "@blitzjs/next";
import { ExternalLinkIcon } from "@heroicons/react/outline"

type ViewJobListingButtonPropsType = {
  companySlug: string
  jobSlug: string
  noPadding?: boolean
}
const ViewJobListingButton = ({
  companySlug,
  jobSlug,
  noPadding,
}: ViewJobListingButtonPropsType) => (
  <Link prefetch={true} href={Routes.JobDescriptionPage({ companySlug, jobSlug })} passHref legacyBehavior>
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={`flex whitespace-nowrap items-center underline text-theme-600 ${
        noPadding ? "" : "py-2"
      } hover:text-theme-800`}
    >
      <span>View Job Listing</span>
      <ExternalLinkIcon className="w-4 h-4 ml-1" />
    </a>
  </Link>
)

export default ViewJobListingButton
