import { Routes } from "@blitzjs/next"
import { ArrowNarrowLeftIcon } from "@heroicons/react/outline"
import Link from "next/link"
import LandingLayout from "src/core/layouts/LandingLayout"

export default function Pricing({}) {
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
          <section className="w-full xl:w-3/4">
            <div className="w-full text-center mt-4">
              <span className="text-2xl lg:text-3xl bg-yellow-200 px-3 rounded-tl-2xl rounded-br-2xl">
                Say no to costly subscriptions
              </span>
            </div>

            <div className="w-full md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
              <div className="rounded-lg md:rounded-none md:rounded-l-lg bg-white my-10">
                <div className="w-full p-8 text-center bg-white border-b rounded-t-lg md:rounded-none md:rounded-tl-lg sticky top-0">
                  <span className="text-3xl font-bold">🤩 Free</span>
                  <br />
                  <div className="mt-2">
                    <span className="text-lg">Essential features</span>
                  </div>
                </div>
                <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                  <li className="py-3">
                    <div className="text-neutral-600">Company with Careers Page</div>
                    <div>One</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Jobs</div>
                    <div>3 Active</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidates</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Emails</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Interview Scheduling</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Score Card Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Pools</div>
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
                    <div className="text-neutral-600">Email Templates</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Team Collaboration</div>
                    <div>No</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate File Uploads</div>
                    <div>No</div>
                  </li>
                </ul>
                <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg md:rounded-bl-lg rounded-t-none overflow-hidden p-6">
                  <div className="w-full pb-3 text-4xl font-bold text-center">Free</div>
                  <div className="w-full flex items-center justify-center">
                    {/* Uncomment the below line and comment the next one when you want to provide Sign Up */}
                    {/* <Link href={Routes.OldSignupPage()} legacyBehavior> */}
                    <Link href={Routes.Home()} legacyBehavior>
                      <a className="w-full text-center px-4 py-1 border-2 rounded border-theme-600 hover:bg-theme-600 hover:text-white">
                        Get Started
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white md:drop-shadow-2xl md:z-10 py-10">
                <div className="-mt-16 flex items-center justify-center">
                  <div className="px-4 py-2 bg-indigo-600 text-white rounded-t-lg w-fit">
                    Recommended
                  </div>
                </div>
                <div className="mt-6 w-full p-8 text-center bg-white border-b sticky top-0">
                  <span className="text-3xl font-bold">💝 Lifetime</span>
                  <br />
                  <div className="mt-2">
                    <span className="text-lg">All the app features</span>
                  </div>
                </div>
                <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                  <li className="py-3">
                    <div className="text-neutral-600">Company with Careers Page</div>
                    <div>One</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Jobs</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidates</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Emails</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Interview Scheduling</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Score Card Customisation</div>
                    <div>Yes</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate Pools</div>
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
                    <div className="text-neutral-600">Email Templates</div>
                    <div>Unlimited</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Team Collaboration</div>
                    <div>Unlimited Team Members</div>
                  </li>
                  <li className="py-3">
                    <div className="text-neutral-600">Candidate File Uploads</div>
                    <div>Unlimited Files</div>
                  </li>
                </ul>
                <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg rounded-t-none overflow-hidden p-6">
                  <div className="w-full pb-3 text-4xl font-bold text-center">$29 Once</div>
                  <div className="w-full flex items-center justify-center">
                    {/* Uncomment the below line and comment the next one when you want to provide Sign Up */}
                    {/* <Link href={Routes.OldSignupPage()} legacyBehavior> */}
                    <Link href={Routes.Home()} legacyBehavior>
                      <a className="w-full text-center px-4 py-1 border-2 border-theme-600 hover:border-theme-700 rounded text-white bg-theme-600 hover:bg-theme-700">
                        Buy Now
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-lg md:rounded-none md:rounded-r-lg bg-white my-10">
                <div className="opacity-50">
                  <div className="w-full p-8 text-center bg-white border-b rounded-t-lg md:rounded-tr-lg sticky top-0">
                    <span className="text-3xl font-bold">🚀 Recruiter</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">Unlimited Companies</span>
                    </div>
                  </div>
                  <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300">
                    <li className="py-3">
                      <div className="text-neutral-600">Company with Careers Page</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Jobs</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Emails</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Interview Scheduling</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Score Card Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Pools</div>
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
                      <div className="text-neutral-600">Email Templates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Team Collaboration</div>
                      <div>Unlimited Team Members</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate File Uploads</div>
                      <div>Unlimited Files</div>
                    </li>
                  </ul>
                  <div className="sticky bottom-0 bg-white border-t mt-auto rounded-b-lg md:rounded-br-lg rounded-t-none overflow-hidden p-6">
                    <div className="w-full pb-3 text-4xl font-bold text-center">$19/month</div>
                    <div className="w-full flex items-center justify-center space-x-2 py-1 border-2 border-transparent whitespace-nowrap">
                      <ArrowNarrowLeftIcon className="w-5 h-5 hidden md:block" />
                      <span>Requires Lifetime Plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 w-full flex flex-col lg:flex-row items-center justify-center space-y-10 lg:space-y-0 lg:space-x-20">
              <div className="w-96 p-3 flex flex-col items-center justify-center space-y-2 border border-neutral-400 rounded bg-white">
                <div className="text-xl">What's next?</div>
                <a
                  target="_blank"
                  rel="self"
                  href="https://roadmap.hire.win/ideas"
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Check our Roadmap to see upcoming new features!
                </a>
              </div>
              <div className="w-96 p-3 flex flex-col items-center justify-center space-y-2 border border-neutral-400 rounded bg-white">
                <div className="text-xl">Pricing Questions?</div>
                <a
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  href="javascript:void(Tawk_API.maximize())"
                >
                  Get help from our experts
                </a>
              </div>
            </div>

            {/* <div className="mt-12 flex flex-col justify-center space-y-8 md:flex-row md:space-x-0 md:space-y-0">
              <div className="flex flex-col w-full lg:w-1/3 rounded-lg bg-white">
                <div className="flex-1 rounded-t rounded-b-none overflow-hidden">
                  <div className="w-full p-8 text-center">
                    <span className="text-3xl font-bold">🤩 Free</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">Essential features</span>
                    </div>
                  </div>
                  <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300 font-medium">
                    <li className="py-3">
                      <div className="text-neutral-600">Companies</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Careers Pages</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Jobs</div>
                      <div>3 Active</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Emails</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Interview Scheduling</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Score Card Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Pools</div>
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
                      <div className="text-neutral-600">Email Templates</div>
                      <div>No</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Team Collaboration</div>
                      <div>No</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate File Uploads</div>
                      <div>No</div>
                    </li>
                  </ul>
                </div>
                <div className="sticky bg-white shadow bottom-0 mt-auto rounded-b rounded-t-none overflow-hidden p-6">
                  <div className="w-full py-6 text-4xl font-bold text-center">Free</div>
                </div>
              </div>

              <div className="flex flex-col w-full lg:w-1/3 rounded-lg bg-white drop-shadow-2xl">
                <div className="-mt-10 flex items-center justify-center">
                  <div className="px-4 py-2 bg-indigo-600 text-white rounded-t-lg w-fit">
                    Recommended
                  </div>
                </div>
                <div className="flex-1 rounded-t rounded-b-none overflow-hidden">
                  <div className="w-full p-8 text-center">
                    <span className="text-3xl font-bold">💝 Lifetime</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">All the app features</span>
                    </div>
                  </div>
                  <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300 font-medium">
                    <li className="py-3">
                      <div className="text-neutral-600">Companies</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Careers Pages</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Jobs</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Emails</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Interview Scheduling</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Score Card Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Pools</div>
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
                      <div className="text-neutral-600">Email Templates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Team Collaboration</div>
                      <div>Unlimited Team Members</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate File Uploads</div>
                      <div>Unlimited Files</div>
                    </li>
                  </ul>
                </div>
                <div className="sticky bg-white shadow bottom-0 mt-auto rounded-b rounded-t-none overflow-hidden p-6">
                  <div className="w-full py-6 text-4xl font-bold text-center">$29 Once</div>
                </div>
              </div>

              <div className="flex flex-col w-full lg:w-1/3 rounded-lg bg-white">
                <div className="flex-1 rounded-t rounded-b-none overflow-hidden">
                  <div className="w-full p-8 text-center">
                    <span className="text-3xl font-bold">🤩 Free</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">Essential features</span>
                    </div>
                  </div>
                  <ul className="w-full px-8 grid grid-cols-1 divide-y divide-gray-300 font-medium">
                    <li className="py-3">
                      <div className="text-neutral-600">Companies</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Careers Pages</div>
                      <div>One</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Jobs</div>
                      <div>3 Active</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidates</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Emails</div>
                      <div>Unlimited</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Interview Scheduling</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Score Card Customisation</div>
                      <div>Yes</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate Pools</div>
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
                      <div className="text-neutral-600">Email Templates</div>
                      <div>No</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Team Collaboration</div>
                      <div>No</div>
                    </li>
                    <li className="py-3">
                      <div className="text-neutral-600">Candidate File Uploads</div>
                      <div>No</div>
                    </li>
                  </ul>
                </div>
                <div className="sticky bg-white shadow bottom-0 mt-auto rounded-b rounded-t-none overflow-hidden p-6">
                  <div className="w-full py-6 text-4xl font-bold text-center">Free</div>
                </div>
              </div>
            </div> */}
          </section>
        </div>
      </section>
    </LandingLayout>
  )
}
