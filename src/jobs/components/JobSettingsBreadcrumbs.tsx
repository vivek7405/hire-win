import Breadcrumbs from "src/core/components/Breadcrumbs"
import { ExtendedJob } from "types"
import ViewJobListingButton from "./ViewJobListingButton"

type JobSettingsBreadcrumbsPropsType = {
  job: ExtendedJob
}
const JobSettingsBreadcrumbs = ({ job }: JobSettingsBreadcrumbsPropsType) => {
  return (
    <>
      <div className="hidden md:block lg:block md:float-right lg:float-right">
        <ViewJobListingButton
          noPadding={true}
          companySlug={job?.company?.slug || "0"}
          jobSlug={job?.slug || "0"}
        />
      </div>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <div className="md:hidden lg:hidden flex items-center justify-center my-5">
        <ViewJobListingButton
          noPadding={true}
          companySlug={job?.company?.slug || "0"}
          jobSlug={job?.slug || "0"}
        />
      </div>
    </>
  )
}

export default JobSettingsBreadcrumbs
