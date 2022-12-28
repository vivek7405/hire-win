import { Country, State } from "country-state-city"
import { titleCase } from "src/core/utils/titleCase"

type JobFiltersInputType = {
  filters: any
  categoryId: string
  setCategoryId: any
  jobType: string
  setJobType: any
  remoteOption: string
  setRemoteOption: any
  setJobCity: any
  setJobState: any
  setJobCountry: any
  setSearchJobTitle: any
  setSearchString: any
  companyId?: string
  setCompanyId?: any
  isJobBoard: boolean
}
const JobFilters = ({
  filters,
  companyId,
  setCompanyId,
  categoryId,
  setCategoryId,
  jobType,
  setJobType,
  remoteOption,
  setRemoteOption,
  setJobCity,
  setJobState,
  setJobCountry,
  setSearchJobTitle,
  setSearchString,
  isJobBoard,
}: JobFiltersInputType) => {
  return (
    <>
      <div>
        <div className="flex flex-col space-y-5">
          {isJobBoard && (
            <div className="w-full">
              <select
                value={companyId || ""}
                onChange={(e) => {
                  setCompanyId && setCompanyId(e.target.value)
                }}
                className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full lg:w-48 truncate pr-8"
              >
                <option value="">All companies</option>
                {filters?.companies?.map((company) => {
                  return <option value={company?.id}>{company?.name}</option>
                })}
              </select>
            </div>
          )}

          <div className="w-full">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
              }}
              className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
            >
              <option value="">All categories</option>
              {filters?.categories?.map((category) => {
                return <option value={category?.id}>{category?.name}</option>
              })}
            </select>
          </div>

          <div className="w-full">
            <select
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value)
              }}
              className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
            >
              <option value="">All types</option>
              {filters?.jobTypes?.map((jobType) => {
                return <option value={jobType}>{titleCase(jobType?.replaceAll("_", " "))}</option>
              })}
            </select>
          </div>

          <div className="w-full">
            <select
              onChange={(e) => {
                const jobLocation = e.target.value

                if (jobLocation) {
                  const countryStateCity = jobLocation?.split(",")

                  if (countryStateCity?.length === 3) {
                    setJobCity(countryStateCity[0] || "")
                    setJobState(countryStateCity[1] || "")
                    setJobCountry(countryStateCity[2] || "")
                  }
                } else {
                  setJobCity("")
                  setJobState("")
                  setJobCountry("")
                }
              }}
              className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
            >
              <option value="">All locations</option>
              {filters?.jobLocations?.map((location) => {
                const countryStateCity = location?.split(",")

                return countryStateCity?.length === 3 ? (
                  <option value={location}>
                    {countryStateCity[0]}
                    {countryStateCity[0] && (countryStateCity[1] || countryStateCity[2]) && ", "}

                    {countryStateCity[1] &&
                      countryStateCity[2] &&
                      State.getStateByCodeAndCountry(countryStateCity[1], countryStateCity[2])
                        ?.name}

                    {countryStateCity[1] && countryStateCity[2] && ", "}
                    {countryStateCity[2] && Country.getCountryByCode(countryStateCity[2])?.name}
                  </option>
                ) : (
                  <option value={location}>{location}</option>
                )
              })}
            </select>
          </div>

          <div className="w-full">
            <select
              value={remoteOption}
              onChange={(e) => {
                setRemoteOption(e.target.value)
              }}
              className="border border-neutral-300 text-neutral-500 rounded px-2 py-1 w-full md:w-48 truncate pr-8"
            >
              <option value="">All Remote Options</option>
              {filters?.remoteOptions?.map((remoteOption) => {
                return (
                  <option value={remoteOption}>
                    {titleCase(remoteOption?.replaceAll("_", " "))}
                  </option>
                )
              })}
            </select>
          </div>

          <button
            className="w-fit text-left text-theme-600 hover:text-theme-800"
            onClick={(e) => {
              e.preventDefault()

              setCompanyId && setCompanyId("")

              setCategoryId("")
              setJobType("")

              setJobCity("")
              setJobState("")
              setJobCountry("")

              setRemoteOption("")

              setSearchJobTitle("")
              setSearchString('""')
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </>
  )
}

export default JobFilters
