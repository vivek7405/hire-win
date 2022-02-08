import { ReactNode, useEffect, useState } from "react"
import { Head, Link, Routes } from "blitz"
import { AttachmentObject, ExtendedJob, ExtendedUser } from "types"
import { Country, State } from "country-state-city"
import { titleCase } from "../utils/titleCase"
import draftToHtml from "draftjs-to-html"
import { useThemeContext } from "../hooks/useTheme"

type JobApplicationLayoutProps = {
  children: ReactNode
  user: ExtendedUser
  job?: ExtendedJob
  isJobBoard?: boolean
}

const JobApplicationLayout = ({ children, user, job, isJobBoard }: JobApplicationLayoutProps) => {
  const logo: AttachmentObject = JSON.parse(JSON.stringify(user?.logo)) || {
    Location: "",
    Key: "",
  }

  const { theme, setTheme } = useThemeContext()
  useEffect(() => {
    const themeName = user?.theme || process.env.DEFAULT_THEME || "indigo"
    setTheme(themeName)
  }, [setTheme, user?.theme])

  return (
    <>
      <Head>
        {isJobBoard && (
          <title>{`Job Board | ${titleCase(user?.companyName?.toLocaleLowerCase())}`}</title>
        )}
        {!isJobBoard && (
          <title>{`Job Application | ${titleCase(job?.title?.toLocaleLowerCase())} | ${titleCase(
            user?.companyName?.toLocaleLowerCase()
          )}`}</title>
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col justify-between space-y-6">
        <header className="py-10 bg-white">
          <div className="flex justify-center items-center">
            <span className="self-center cursor-pointer">
              <Link href={Routes.JobBoard({ companySlug: user?.slug })}>
                <img src={logo?.Location} alt={`${user?.companyName} logo`} width={200} />
              </Link>
            </span>
          </div>
          {!isJobBoard && (
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
                {job?.category && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{job.category?.name}</span>}
                {job?.employmentType && (
                  <span>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    {titleCase(job.employmentType?.join(" ")?.replaceAll("_", " "))}
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
          <div className="text-neutral-50 flex flex-col space-y-3 justify-center items-center bg-theme-600 h-32">
            <div className="flex justify-center items-center">
              {!isJobBoard && (
                <span className="hover:text-neutral-200">
                  <Link href={Routes.JobBoard({ companySlug: user?.slug })}>View all jobs</Link>
                </span>
              )}
              <span className="hover:text-neutral-200">
                {user?.website && (
                  <a href={user.website} target="_blank" rel="noreferrer">
                    {!isJobBoard && <>&nbsp;&nbsp;·&nbsp;&nbsp;</>}View Website
                  </a>
                )}
              </span>
            </div>
            <hr />
            <div className="flex justify-center items-center">
              <span>Powered by&nbsp;</span>
              <span className="underline hover:text-neutral-200">
                <Link href={Routes.Home()}>hire.win</Link>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default JobApplicationLayout
