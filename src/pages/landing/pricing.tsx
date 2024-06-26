import { Routes } from "@blitzjs/next"
import { ArrowNarrowLeftIcon } from "@heroicons/react/outline"
import Link from "next/link"
import { useState } from "react"
import LandingLayout from "src/core/layouts/LandingLayout"
import { FREE_CANDIDATES_LIMIT, FREE_COMPANIES_LIMIT, FREE_JOBS_LIMIT } from "src/plans/constants"

export default function Pricing({}) {
  // const [licenseTier, setLicenseTier] = useState(1)

  // const LicenseTierSelect = ({}) => {
  //   return (
  //     <select
  //       className="w-40 px-4 py-1 rounded border-2 border-theme-600"
  //       value={licenseTier}
  //       onChange={(e) => {
  //         setLicenseTier(parseInt(e.target.value || "1"))
  //       }}
  //     >
  //       <option value="1">License Tier 1</option>
  //       <option value="2">License Tier 2</option>
  //       <option value="3">License Tier 3</option>
  //       <option value="4">License Tier 4</option>
  //       <option value="5">License Tier 5</option>
  //       <option value="6">License Tier 6</option>
  //       <option value="7">License Tier 7</option>
  //       <option value="8">License Tier 8</option>
  //       <option value="9">License Tier 9</option>
  //       <option value="10">License Tier 10</option>
  //     </select>
  //   )
  // }

  return (
    <LandingLayout title="Hire.win | Pricing">
      <section className="px-4">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="w-full my-2 text-4xl lg:text-5xl font-black text-center text-neutral-800">
            Pricing
          </h2>
          <div className="w-full mb-4">
            <div className="h-1 mx-auto bg-gradient-to-r from-neutral-400 to-neutral-700 w-40 lg:w-48 opacity-25 my-0 py-0 rounded-t"></div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center">
          <section className="w-full sm:w-2/3 md:w-5/6 lg:w-3/4 xl:w-3/5">
            <div className="w-full text-center mt-4">
              <span className="text-2xl lg:text-3xl bg-yellow-200 px-3 rounded-tl-2xl rounded-br-2xl">
                Our pricing is as simple as our product!
              </span>
            </div>

            <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* <div className="rounded-lg md:rounded-none md:rounded-l-lg bg-white my-10"> */}
              <div className="rounded-lg bg-white">
                {/* <div className="w-full p-8 text-center bg-white border-b rounded-t-lg md:rounded-none md:rounded-tl-lg sticky top-0"> */}
                <div className="mt-5 w-full p-8 text-center bg-white border-b rounded-t-lg sticky top-0">
                  <span className="text-3xl font-bold">🤩 Free</span>
                  <br />
                  <div className="mt-2">
                    <span className="text-lg">Essential Features</span>
                  </div>
                  {/* <div className="mt-2 invisible">
                    <LicenseTierSelect />
                  </div> */}
                </div>
                <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                  <li className="py-3">
                    <div className="text-neutral-600">Company with Careers Page</div>
                    <div>{FREE_COMPANIES_LIMIT} Company</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Jobs per company</div>
                    <div>{FREE_JOBS_LIMIT} Active Jobs at a time</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidates per job</div>
                    <div>{FREE_CANDIDATES_LIMIT} Candidates</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Team Collaboration</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate File Uploads</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Embed Job Posts on Website</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Score Card Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Notes</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Comments</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Activity</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Theme Customisation</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Job Stages Customisation</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Application Form Customisation</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Google Jobs Integration</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Interview Scheduling</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Pools</div>
                    <div>Only Defaults</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Email Templates</div>
                    <div>Only Defaults</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Emails</div>
                    <div>Unlimited Emails</div>
                  </li>
                </ul>
                <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg md:rounded-bl-lg rounded-t-none overflow-hidden p-6">
                  <div className="w-full pb-3 text-4xl font-bold text-center">Free</div>
                  <div className="w-full flex items-center justify-center">
                    {/* Uncomment the below line and comment the next one when you want to provide Sign Up */}
                    {/* <Link href={Routes.Home()} legacyBehavior> */}
                    <Link href={Routes.OldSignupPage()} legacyBehavior>
                      <a className="w-full text-center px-4 py-1 border-2 rounded border-theme-600 hover:bg-theme-600 hover:text-white">
                        Get Started
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              {/* <div className="rounded-lg bg-white md:drop-shadow-2xl md:z-10 py-10"> */}
              <div className="rounded-lg bg-white md:drop-shadow-2xl md:z-10">
                <div className="-mt-5 flex items-center justify-center">
                  <div className="px-4 py-2 bg-indigo-600 text-white rounded-t-lg w-fit">
                    Recommended
                  </div>
                </div>
                <div className="w-full p-8 text-center bg-white border-b sticky top-0 rounded-t-lg">
                  <span className="text-3xl font-bold">🚀 Recruiter</span>
                  <br />
                  <div className="mt-2">
                    <span className="text-lg whitespace-nowrap">All the app features</span>
                  </div>
                  {/* <div className="mt-2">
                    <LicenseTierSelect />
                  </div> */}
                </div>
                <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                  <li className="py-3">
                    <div className="text-neutral-600">Company with Careers Page</div>
                    <div>Unlimited Companies</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Jobs per company</div>
                    <div>Unlimited Jobs</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidates per job</div>
                    <div>Unlimited Candidates</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Team Collaboration</div>
                    <div>Unlimited Users</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate File Uploads</div>
                    <div>Unlimited Files</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Embed Job Posts on Website</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Score Card Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Notes</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Comments</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Activity</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Theme Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Job Stages Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Application Form Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Google Jobs Integration</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Interview Scheduling</div>
                    <div>Unlimited Interviews</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Pools</div>
                    <div>Unlimited Pools</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Email Templates</div>
                    <div>Unlimited Templates</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Emails</div>
                    <div>Unlimited Emails</div>
                  </li>
                </ul>
                <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg rounded-t-none overflow-hidden p-6">
                  <div className="w-full pb-3 text-4xl font-bold text-center">
                    <span>
                      Flat $29<span className="text-lg">/month</span>
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-center">
                    {/* Uncomment the below line and comment the next one when you want to provide Sign Up */}
                    {/* <Link href={Routes.Home()} legacyBehavior> */}
                    <Link href={Routes.UserSettingsBillingPage()} legacyBehavior passHref>
                      <a className="w-full text-center px-4 py-1 border-2 border-theme-600 hover:border-theme-700 rounded text-white bg-theme-600 hover:bg-theme-700">
                        Subscribe Now
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              {/* <div className="rounded-lg md:rounded-none md:rounded-r-lg bg-white my-10">
                <div className="opacity-50">
                  <div className="w-full p-8 text-center bg-white border-b rounded-t-lg md:rounded-tr-lg sticky top-0">
                    <span className="text-3xl font-bold">🚀 Recruiter</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">Beyond Limits</span>
                    </div>
                    <div className="mt-2 invisible">
                      <LicenseTierSelect />
                    </div>
                  </div>
                  <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                    <li className="py-3">
                      <div className="text-neutral-600">Company with Careers Page</div>
                      <div className="whitespace-nowrap">⭐️ Unlimited Companies</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Jobs per company</div>
                      <div className="whitespace-nowrap">Unlimited Jobs</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Users per Company</div>
                      <div className="whitespace-nowrap">Unlimited Collaboration</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Score Card Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Notes</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Comments</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Activity</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Theme Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Job Stages Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Application Form Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Interview Scheduling</div>
                      <div>Unlimited Interviews</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate File Uploads</div>
                      <div>Unlimited Files</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Pools</div>
                      <div>Unlimited Pools</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Email Templates</div>
                      <div>Unlimited Templates</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Emails</div>
                      <div>Unlimited Emails</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidates per job</div>
                      <div className="whitespace-nowrap">Unlimited Candidates</div>
                    </li>
                  </ul>
                  <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg md:rounded-br-lg rounded-t-none overflow-hidden p-6">
                    <div className="w-full pb-3 text-4xl font-bold text-center">$19/month</div>
                    <div className="w-full flex items-center justify-center">
                      <Link href={Routes.Home()} legacyBehavior>
                        <a className="w-full text-center px-4 py-1 border-2 rounded border-theme-600 hover:bg-theme-600 hover:text-white">
                          Go Truly Unlimited!
                        </a>
                      </Link>
                    </div>
                    <div className="w-full flex items-center justify-center space-x-2 py-1 border-2 border-transparent whitespace-nowrap">
                      <ArrowNarrowLeftIcon className="w-5 h-5 hidden md:block" />
                      <span>Requires Lifetime Plan</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-3 flex flex-col items-center justify-center space-y-2 border border-neutral-400 rounded bg-white">
                <div className="text-xl text-center">What's next?</div>
                <a
                  target="_blank"
                  rel="self"
                  href="https://roadmap.hire.win/roadmap"
                  className="text-sm text-center text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Check our Roadmap to see upcoming new features!
                </a>
              </div>
              <div className="p-3 flex flex-col items-center justify-center space-y-2 border border-neutral-400 rounded bg-white">
                <div className="text-xl text-center">Pricing Questions?</div>
                <a
                  className="text-sm text-center text-indigo-600 hover:text-indigo-800 hover:underline"
                  href="javascript:void(Tawk_API.maximize())"
                >
                  Get help from our experts
                </a>
              </div>
            </div>
          </section>
        </div>
      </section>
    </LandingLayout>
  )
}
