import { ReactNode, useEffect, useState } from "react"
import { Head, Link, Routes, Script } from "blitz"
import { AttachmentObject, ExtendedJob, ExtendedUser } from "types"
import { Country, State } from "country-state-city"
import { titleCase } from "../utils/titleCase"
import draftToHtml from "draftjs-to-html"
import moment from "moment"
import { Company } from "@prisma/client"

function getGoogleJobPostingStructuredData(job: ExtendedJob, company: Company) {
  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job?.title,
    description: draftToHtml(job?.description),
    identifier: {
      "@type": "PropertyValue",
      name: company?.name,
      value: job?.id,
    },
    datePosted: moment(job?.createdAt).format("YYYY-MM-DD"),
    validThrough: moment(job?.validThrough).format("YYYY-MM-DDT00:00"),
    employmentType: job?.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: company?.name,
      sameAs: company?.website,
      logo: (company?.logo as AttachmentObject)?.Location,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job?.city,
        addressRegion: job?.state,
        addressCountry: job?.country,
      },
    },
    jobLocationType: job?.remote ? "TELECOMMUTE" : "",
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: job?.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job?.minSalary,
        maxValue: job?.maxSalary,
        unitText: job?.salaryType,
      },
    },
  }
}

type JobApplicationLayoutProps = {
  children: ReactNode
  job?: ExtendedJob
  company?: Company
  isCareersPage?: boolean
  addGoogleJobPostingScript?: boolean
}

const JobApplicationLayout = ({
  children,
  company,
  job,
  isCareersPage,
  addGoogleJobPostingScript,
}: JobApplicationLayoutProps) => {
  const logo = company?.logo as AttachmentObject

  const [theme, setTheme] = useState(company?.theme || "indigo")
  useEffect(() => {
    const themeName = company?.theme || "indigo"
    setTheme(themeName)
  }, [setTheme, company?.theme])

  // ADDED FOR TESTING
  useEffect(() => {
    if (addGoogleJobPostingScript && job) {
      console.log(getGoogleJobPostingStructuredData(job, company!))
    }
  }, [job, addGoogleJobPostingScript, company])

  return (
    <>
      <Head>
        {isCareersPage && (
          <title>{`Job Board | ${titleCase(company?.name?.toLocaleLowerCase())}`}</title>
        )}
        {!isCareersPage && (
          <title>{`Job Application | ${titleCase(job?.title?.toLocaleLowerCase())} | ${titleCase(
            company?.name?.toLocaleLowerCase()
          )}`}</title>
        )}
        <link rel="icon" href="/favicon.ico" />
        {addGoogleJobPostingScript && job && (
          <script
            id={`jobJSON-${job?.id}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getGoogleJobPostingStructuredData(job, company!)),
            }}
          />
        )}
      </Head>
      <div className={`min-h-screen flex flex-col justify-between space-y-6 theme-${theme}`}>
        <header className="py-10 bg-white">
          <div className="flex justify-center items-center">
            <span className="self-center cursor-pointer">
              {company?.slug && (
                <Link href={Routes.CareersPage({ companySlug: company?.slug })}>
                  {logo?.Location ? (
                    <img src={logo?.Location} alt={`${company?.name} logo`} width={200} />
                  ) : (
                    <h1 className="text-3xl font-bold">{company?.name}</h1>
                  )}
                </Link>
              )}
            </span>
          </div>
          {!isCareersPage && (
            <div className="mt-6 flex flex-col space-y-2 justify-center items-center">
              <h3 className="text-2xl font-bold">{job?.title}</h3>
              {job?.remote && (
                <span className="text-xs uppercase font-semibold inline-block py-1 px-2 rounded-full text-pink-600 bg-pink-200 last:mr-0 mr-1">
                  Remote
                </span>
              )}
              <div className="flex flex-wrap justify-center items-center mx-3">
                <span>{job?.city},&nbsp;</span>
                <span>
                  {State.getStateByCodeAndCountry(job?.state!, job?.country!)?.name},&nbsp;
                </span>
                <span>{Country.getCountryByCode(job?.country!)?.name}</span>
                {job?.category && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{job?.category?.name}</span>}
                {job?.employmentType && (
                  <span>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    {titleCase(job?.employmentType?.join(" ")?.replaceAll("_", " "))}
                  </span>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="w-full md:w-3/5 lg:w-3/5 xl:w-3/5 2xl:w-3/5 max-w-7xl mx-auto sm:px-6 lg:px-8 bg-gray-100">
          <div className="px-4 sm:px-0">
            <main>{children}</main>
          </div>
        </div>

        <footer>
          <div
            className={`text-neutral-50 flex flex-col ${
              !(isCareersPage && !company?.website) && "space-y-3"
            } justify-center items-center bg-theme-600 h-32`}
          >
            <div className="flex justify-center items-center">
              {!isCareersPage && (
                <span className="hover:text-neutral-200">
                  {company?.slug && (
                    <Link href={Routes.CareersPage({ companySlug: company?.slug })}>
                      View all jobs
                    </Link>
                  )}
                </span>
              )}
              <span className="hover:text-neutral-200">
                {company?.website && (
                  <a href={company?.website} target="_blank" rel="noreferrer">
                    {!isCareersPage && <>&nbsp;&nbsp;·&nbsp;&nbsp;</>}View Website
                  </a>
                )}
              </span>
            </div>
            {!(isCareersPage && !company?.website) && <hr />}
            <div className="flex justify-center items-center">
              <span>Powered by&nbsp;</span>
              <span className="underline hover:text-neutral-200">
                <Link href={Routes.JobsHome()}>hire.win</Link>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default JobApplicationLayout
