import { Routes } from "@blitzjs/next"
import { RemoteOption } from "@prisma/client"
import { Country, State } from "country-state-city"
import getSymbolFromCurrency from "currency-symbol-map"
import moment from "moment"
import Link from "next/link"
import { titleCase } from "src/core/utils/titleCase"
import getSalaryIntervalFromSalaryType from "../utils/getSalaryIntervalFromSalaryType"

const JobPost = ({ job, embed, companySlug, isJobBoard }) => {
  return (
    <>
      <div key={job.id}>
        <div className="bg-white w-full border-2 border-gray-200 hover:border-gray-300 hover:shadow rounded cursor-pointer px-5 py-3">
          <Link
            legacyBehavior
            prefetch={true}
            href={Routes.JobDescriptionPage({
              companySlug,
              jobSlug: job.slug,
            })}
            passHref
          >
            <a className="overflow-hidden" target={embed ? "_blank" : ""} rel="noreferrer">
              <div className="flex flex-wrap items-start justify-between">
                <div className="pb-4">
                  {isJobBoard && (
                    <div className="pb-2">
                      <div className="border border-neutral-300 rounded px-1 text-neutral-500 w-fit">
                        {job?.company?.name}
                      </div>
                    </div>
                  )}
                  <div className="font-bold text-xl text-theme-700 whitespace-normal">
                    {job?.title}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Posted{" "}
                    {moment(job.createdAt || undefined)
                      .local()
                      .fromNow()}
                    {/* ,{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()
                            .includes("ago")
                            ? "expired"
                            : "expires"}{" "}
                          {moment(job.validThrough || undefined)
                            .local()
                            .fromNow()} */}
                  </p>
                </div>
                <div className="pt-2 pb-4">
                  {job?.showSalary && (job?.minSalary > 0 || job?.maxSalary > 0) && (
                    <p className="text-gray-500 text-sm">
                      {job?.currency && getSymbolFromCurrency(job?.currency)}
                      {job?.minSalary > 0 && job?.minSalary}
                      {job?.minSalary > 0 && job?.maxSalary > 0 && " - "}
                      {job?.maxSalary > 0 && job?.maxSalary}
                      {` ${getSalaryIntervalFromSalaryType(job?.salaryType)?.toLowerCase()}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-4 flex flex-wrap">
                {(job?.city || job?.state || job?.country) && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {job?.city && <span>{job?.city},&nbsp;</span>}
                    {job?.state && job?.country && (
                      <span>
                        {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name}
                        ,&nbsp;
                      </span>
                    )}
                    {job?.country && <span>{Country.getCountryByCode(job?.country!)?.name}</span>}
                  </span>
                )}
                {job?.category && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {job.category?.name}
                  </span>
                )}
                {job?.jobType && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {titleCase(job.jobType?.replaceAll("_", " "))}
                  </span>
                )}
                {job?.remoteOption !== RemoteOption.No_Remote && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {job?.remoteOption?.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            </a>
          </Link>
        </div>
      </div>
    </>
  )
}

export default JobPost
