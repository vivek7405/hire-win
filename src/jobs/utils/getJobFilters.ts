export default function getJobFilters(jobs) {
  const companies = jobs
    ?.map((job) => job.company)
    ?.filter((company) => company !== null && company?.name !== "")
    // Unique values
    ?.filter(
      (company, index, self) => self.findIndex((comp) => comp?.name === company?.name) === index
    )

  const categories = jobs
    ?.map((job) => job.category)
    ?.filter((category) => category !== null && category?.name !== "")
    // Unique values
    ?.filter(
      (category, index, self) => self.findIndex((cat) => cat?.name === category?.name) === index
    )

  const jobTypes = jobs
    ?.map((job) => job.jobType)
    ?.filter((jobType) => jobType !== null)
    // Get Unique values
    ?.filter((jobType, index, self) => self.indexOf(jobType) == index)

  const jobLocations = jobs
    ?.filter((job) => job.city || job.state || job.country)
    ?.map((job) => `${job?.city},${job?.state},${job?.country}`)
    // Unique values
    ?.filter((location, index, self) => self.indexOf(location) == index)

  const remoteOptions = jobs
    ?.map((job) => job.remoteOption)
    ?.filter((remoteOption) => remoteOption !== null)
    // Unique values
    ?.filter((remoteOption, index, self) => self.indexOf(remoteOption) == index)

  return {
    companies,
    categories,
    jobTypes,
    jobLocations,
    remoteOptions,
  }
}
