import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useQuery } from "@blitzjs/rpc"
import { GetServerSidePropsContext } from "next"
// import { GetStaticPropsContext } from "blitz"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import LogoBrand from "src/assets/LogoBrand"
import { Suspense, useEffect, useState } from "react"
import LandingLayout from "src/core/layouts/LandingLayout"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import Form from "src/core/components/Form"
import { Currency, PlanFrequency } from "types"
import LocaleCurrency from "locale-currency"
import getAllPlans from "src/plans/queries/getAllPlans"
import getCurrencySymbol from "src/plans/utils/getCurrencySymbol"
import { getCalApi } from "@calcom/embed-react"
import {
  ArrowNarrowRightIcon,
  ArrowRightIcon,
  ChatAlt2Icon,
  ChatIcon,
  CheckIcon,
  ChevronRightIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  XIcon,
} from "@heroicons/react/outline"
import { useRouter } from "next/router"
import getCookie from "src/core/utils/getCookie"
import { REFERRER_ID_COOKIE_NAME } from "src/core/constants"
import LabeledRatingField from "src/core/components/LabeledRatingField"

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   path.resolve("next.config.js")
//   path.resolve("blitz.config.js")
//   path.resolve(".next/blitz/db.js")

//   const user = await getCurrentUserServer({ ...context })

//   if (user) {
//     return {
//       redirect: {
//         destination: "/jobs",
//         permanent: false,
//       },
//       props: {},
//     }
//   }

//   return { props: {} }
// }

// export async function getStaticProps(context: GetStaticPropsContext) {
//   return {
//     props: {},
//   }
// }

// const Plans = ({ selectedCurrency, selectedFrequency }) => {
//   const [plans] = useQuery(getAllPlans, { })
//   useEffect(() => {
//     invalidateQuery(getAllPlans)
//   }, [selectedCurrency])

//   return (
//     <>
//       {plans.map((plan) => {
//         return (
//           <div
//             key={plan.priceId}
//             className="w-full pb-6"
//             hidden={selectedFrequency !== plan.frequency}
//           >
//             <div className="w-full text-4xl font-bold text-center whitespace-nowrap">
//               <span className="text-base">Flat</span> {plan.currencySymbol}
//               {plan.pricePerMonth}
//               <span className="text-base"> /month</span>
//             </div>
//             <div className="w-full text-base text-center">
//               if paid {plan.frequency.toLowerCase()}
//             </div>
//           </div>
//         )
//       })}
//     </>
//   )
// }

function BookADemoButton({}) {
  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi()
      cal && cal("ui", { theme: "light", styles: { branding: { brandColor: "#4f46e5" } } })
    })()
  }, [])
  return (
    <button
      data-cal-link="hire-win/demo"
      className="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-xl font-semibold"
    >
      Book a Demo
    </button>
  )
}

export default function Home() {
  // const screenshotsBucketURL = "https://s3.us-east-2.amazonaws.com/hire.win/landing-screenshots"

  // const localeCurrency = LocaleCurrency.getCurrency(navigator.language || "en-US") || Currency.USD
  // const [selectedCurrency, setSelectedCurrency] = useState(Currency[localeCurrency] || Currency.USD)

  // const [imageIndex, setImageIndex] = useState(0)
  // const imageArray = [
  //   <Image
  //     priority={true}
  //     layout="fill"
  //     objectFit="contain"
  //     key="jobs"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Jobs.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="kanban board"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Kanban-Board.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="candidates table"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Candidates-Table.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="job edit"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Job-Edit.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="job members"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Job-Members.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="candidate detail"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Candidate-Detail.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="form"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Form.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="workflows"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Workflows.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="workflow"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Workflow.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="score card"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Score-Card.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="interview scheduling"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Interview-Scheduling.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="company settings"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Company-Settings.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="schedules"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Schedules.webp`}
  //   />,
  //   <Image
  //     layout="fill"
  //     objectFit="contain"
  //     key="calendars"
  //     alt="Dashboard Job Listing"
  //     src={`${screenshotsBucketURL}/Calendars.webp`}
  //   />,
  // ]

  const [selectedFrequency, setSelectedFrequency] = useState(PlanFrequency.YEARLY)
  const [email, setEmail] = useState("")

  const router = useRouter()

  return (
    <LandingLayout>
      <div className="h-full">
        <section className="text-center px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black">
            Simple Yet Powerful Hiring Solution
          </h1>
          {/* <p className="mt-2 text-gray-800 text-base md:text-xl lg:text-2xl">
            The simplest way to list jobs, receive applicants and conduct interviews!
          </p> */}

          {/* <div className="w-full flex items-center justify-center"> */}
          <h2 className="max-w-2xl mx-auto mt-6 px-10 text-neutral-800 sm:text-lg lg:text-xl">
            Get an instant Careers Page to list your job openings, along with a powerful Applicant
            Tracking Dashboard to manage candidates.
          </h2>
          {/* </div> */}

          <div className="w-full flex space-x-4 items-center justify-center mt-8">
            <Link href={Routes.OldSignupPage()} legacyBehavior={true}>
              <a className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded text-white">
                Sign Up Free
              </a>
            </Link>
            <Link href={Routes.LoginPage()} legacyBehavior={true}>
              <a className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 rounded">Login</a>
            </Link>
          </div>

          {/* <h2 className="mt-8 text-gray-800 text-sm md:text-lg lg:text-xl italic">
            Traditionally, an Applicant Tracking System (ATS)
          </h2>
          <p className="mt-2 text-gray-800 text-sm md:text-lg italic">
            Everyone including <span className="font-semibold">Small to Big Companies</span>,{" "}
            <span className="font-semibold">Staffing Agencies</span> &{" "}
            <span className="font-semibold">Freelance Recruiters</span> shall fit in well!
          </p> */}

          {/* <div className="w-full flex items-center justify-center mt-4 mb-8">
            <a
              href="https://www.producthunt.com/posts/hire-win?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-hire&#0045;win"
              target="_blank"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=356023&theme=light&period=daily"
                alt="hire&#0046;win - Interviewing&#0032;Kit&#0032;with&#0032;Careers&#0032;Page | Product Hunt"
                className="w-64"
              />
            </a>
          </div> */}

          {/* <div className="w-full flex items-center justify-center mb-8">
            <div className="w-full sm:w-5/6 md:w-3/5 lg:w-1/2 xl:w-2/5 bg-white rounded-xl flex flex-col items-center justify-center space-y-2">
              <div className="w-full p-7">
                <div className="w-full text-sm text-neutral-500 mb-7">
                  Join 100+ other companies who make hiring simpler
                </div>

                <div className="w-full">
                  <Form
                    noFormatting={true}
                    onSubmit={async () => {
                      router.push(Routes.EmailSignupPage({ email }))
                    }}
                  >
                    <div className="flex h-10 items-center justify-center">
                      <input
                        name="email"
                        type="email"
                        required={true}
                        className="w-2/3 h-full rounded-l border-fuchsia-600"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e?.target?.value || "")
                        }}
                      />
                      <button
                        type="submit"
                        className="w-1/3 h-full rounded-r text-white text-lg bg-fuchsia-600 hover:bg-fuchsia-700 px-3 py-1"
                      >
                        Sign up free!
                      </button>
                    </div>
                  </Form>

                  <a href={`/api/auth/google?redirectUrl=${router.query.next ? router.query.next : Routes.JobsHome().pathname}`}>
                    <button className="w-full px-4 py-1 rounded bg-white text-neutral-600 border border-gray-300 hover:bg-gray-50 mt-4 h-10">
                      <div className="flex items-center justify-between">
                        <Image height={20} width={20} src="/GoogleLogo.png" />
                        <span className="w-full text-center">Sign up with Google</span>
                      </div>
                    </button>
                  </a>
                </div>
              </div>

              <div className="w-full border-t border-gray-300 py-3">
                <Link href={Routes.CareersPage({ companySlug: "acme-inc" })} legacyBehavior>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 text-sm text-indigo-700 hover:text-indigo-900"
                  >
                    <span>View careers page example</span>
                    <ArrowNarrowRightIcon className="w-5 h-5" />
                  </a>
                </Link>
              </div>
            </div>
          </div> */}

          <section id="careers-page" className="mx-3 sm:mx-10 mt-10">
            <p className="text-center font-semibold text-lg lg:text-xl">
              You get an instant Careers Page with{" "}
              {/* <span className="bg-yellow-200 rounded-tl-xl rounded-br-xl px-1"> */}
              multiple customisation options including theme color
              {/* </span> */}:
            </p>
            {/* <iframe
            title="Job Posts"
            width="850"
            height="500"
            src="http://localhost:3000/acme-inc?embed=true"
          ></iframe> */}
            <div className="mt-4 w-full h-screen rounded-lg drop-shadow-lg">
              <div className="w-full h-8 space-x-2 px-3 rounded-t-lg bg-neutral-100 flex justify-start items-center drop-shadow-sm shadow-sm">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                <span className="flex-1"></span>
                <a
                  title="Open in new tab"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={
                    process.env.NODE_ENV === "production"
                      ? "https://hire.win/acme-inc"
                      : "http://localhost:3000/acme-inc"
                  }
                  className="text-sm text-neutral-600 hover:underline font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Open in new tab</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>
              </div>
              <div className="bg-white border-t-0 w-full h-full rounded-b-lg">
                <iframe
                  src={
                    process.env.NODE_ENV === "production"
                      ? "https://hire.win/acme-inc"
                      : "http://localhost:3000/acme-inc"
                  }
                  title="Careers Page"
                  className="w-full h-full rounded-b-lg"
                ></iframe>
              </div>
            </div>
          </section>

          {/* <section className="mx-3 sm:mx-10 mt-28"> */}
          <section className="mx-3 sm:mx-10 mt-28 rounded-xl lg:px-48 md:px-12 px-4 py-14 flex flex-col items-center bg-gradient-to-r from-fuchsia-100 via-purple-100 to-indigo-200">
            <div className="mb-5 italic text-lg text-neutral-700">
              Used by companies big and small:
            </div>

            <div className="mb-5 p-10 flex flex-col md:flex-row items-center justify-center gap-16 flex-wrap">
              <img className="h-7" src="landing-screenshots/handle-delivery-logo.png" />
              <img className="h-10" src="landing-screenshots/arthentic-logo.webp" />
              <img className="h-10" src="landing-screenshots/digital-expert-logo.webp" />
              <img className="h-10" src="landing-screenshots/exxonmobil-logo.png" />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="max-w-xs flex flex-col">
                <Form
                  noFormatting={true}
                  onSubmit={async () => {
                    return
                  }}
                >
                  <div className="w-full flex items-center justify-center">
                    <LabeledRatingField
                      name="customerReview1"
                      ratingClass={`!flex items-center`}
                      height={4}
                      color="yellow"
                      value={5}
                      disabled={true}
                      allowCursorWhenDisabled={true}
                    />
                  </div>
                </Form>
                <p className="italic">"Best Careers Page money can buy"</p>
                <p className="text-neutral-800 text-sm">- Arthentic</p>
              </div>

              <div className="max-w-xs flex flex-col">
                <Form
                  noFormatting={true}
                  onSubmit={async () => {
                    return
                  }}
                >
                  <div className="w-full flex items-center justify-center">
                    <LabeledRatingField
                      name="customerReview1"
                      ratingClass={`!flex items-center`}
                      height={4}
                      color="yellow"
                      value={5}
                      disabled={true}
                      allowCursorWhenDisabled={true}
                    />
                  </div>
                </Form>
                <p className="italic">"Truly value for money ATS"</p>
                <p className="text-neutral-800 text-sm">- People Tree Recruitment</p>
              </div>

              <div className="max-w-xs flex flex-col">
                <Form
                  noFormatting={true}
                  onSubmit={async () => {
                    return
                  }}
                >
                  <div className="w-full flex items-center justify-center">
                    <LabeledRatingField
                      name="customerReview1"
                      ratingClass={`!flex items-center`}
                      height={4}
                      color="yellow"
                      value={5}
                      disabled={true}
                      allowCursorWhenDisabled={true}
                    />
                  </div>
                </Form>
                <p className="italic">"Look no further than Hire.win"</p>
                <p className="text-neutral-800 text-sm">- ExxonMobil</p>
              </div>
            </div>
          </section>

          <div className="mt-20 mb-4 w-full flex items-center justify-center">
            {/* <a
              target="_blank"
              rel="referrer"
              href="https://www.indeed.com/hire/c/info/creating-an-interview-kit"
              className="text-xl lg:text-2xl text-black font-bold hover:underline flex items-center justify-center space-x-2"
            > */}
            <div className="text-lg lg:text-xl text-black font-semibold flex items-center justify-center space-x-2">
              You get a fully customisable Applicant Tracking System and a pre-configured Interview
              Kit:
            </div>
            {/* </a> */}
          </div>

          <div className="w-full block sm:hidden md:hidden lg:hidden mobileCandidateHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/candidate-angel.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:block md:hidden lg:hidden smCandidateHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/candidate-angel.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:block lg:hidden mdCandidateHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/candidate-angel.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:hidden lg:block lgCandidateHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/candidate-angel.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>

          <section className="mt-10 rounded-xl bg-black text-white lg:px-48 md:px-12 px-4 py-14 flex flex-col items-center">
            <div>
              <h2 className="text-3xl bg-left-bottom bg-no-repeat pb-8 px-16 mb-8 bg-underline2 bg-100%">
                All the essentials you need
              </h2>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  1
                </div>
                <h3 className="font-medium text-xl mb-2">Instant Careers Page</h3>
                <p className="text-center font-montserrat">
                  Get an instant customisable careers page and list your job openings
                </p>
              </div>
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  2
                </div>
                <h3 className="font-medium text-xl mb-2">Applicant Tracking</h3>
                <p className="text-center font-montserrat">
                  Track applicants across Hiring Stages that can be customised
                </p>
              </div>
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  3
                </div>
                <h3 className="font-medium text-xl mb-2">Team Collaboration</h3>
                <p className="text-center font-montserrat">
                  Collaborate with your team and make important hiring decisions
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col-reverse space-y-reverse space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-1/2">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileInterviewSchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/interview-scheduling-demo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smInterviewSchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/interview-scheduling-demo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdInterviewSchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/interview-scheduling-demo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgInterviewSchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/interview-scheduling-demo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <p className="text-xl font-bold flex items-center justify-center">
                  You get lightning fast 1-click interview scheduling:
                </p>
                <p className="mt-5 text-justify">
                  With Hire.win, you don't just get an Instant Careers Page Builder, but you get all
                  the supporting tools to manage the applicants once they apply using your
                  personalised careers page! Interview Scheduling is one important tool which helps
                  schedule interviews quickly and efficiently.
                </p>
                <p className="mt-5 text-justify">
                  Just ask your team members to connect their work calendars, Google or Outlook and
                  then their availabilities shall be shown while scheduling interviews with them.
                  Select a slot that is available and there you go, a meeting link invite shall be
                  sent to everyone involved in the interview along with the Candidate and the
                  Interviewer!
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-1/2">
                <p className="text-xl font-bold flex items-center justify-center">
                  Add multiple companies and easily switch between them:
                </p>
                <p className="mt-5 text-justify">
                  With Hire.win's flat monthly price of $29/month for the Recruiter Plan, you get
                  incredible features like creating as many companies as you want! Now, this is a
                  deal breaker for Recruiting Agencies & Freelance Recruiters as they deal with
                  multiple companies at once and need a way to separate their data for those
                  companies.
                </p>
                <p className="mt-5 text-justify">
                  The benefit for recruiting agencies & freelance recruiters is that you get a job
                  post link where candidates may apply, your internal hiring team can collaborate
                  with the company's hiring team, and multiple other things you can't just do with
                  Excel Sheets like Candidate File Uploads and an Activity Timeline of the
                  Candidate, that too at just $29/month!
                </p>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompSwitchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-switch.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smCompSwitchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-switch.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdCompSwitchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-switch.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgCompSwitchHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-switch.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-xl lg:px-48 md:px-12 px-4 py-14 flex flex-col items-center bg-gradient-to-r from-fuchsia-100 via-purple-100 to-indigo-200">
            <div>
              <h2 className="text-3xl font-bold bg-left-bottom bg-no-repeat pb-8 px-16 mb-8 bg-underline3 bg-100%">
                Why Use Hire.win?
              </h2>
            </div>
            <div className="px-6 flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-12">
              <div className="max-w-lg">
                <DatabaseIcon className="mb-5 border border-gray-400 rounded-lg p-1 w-10 h-10" />
                <h3 className="font-semibold text-2xl text-left">
                  Your data stays with you forever
                </h3>
                <p className="text-justify">
                  When you use an applicant tracking and recruiting software, your data stays with
                  you forever. All the candidates that you have come across won't be lost and can be
                  very useful for closing future hires.
                </p>
              </div>

              <div className="max-w-lg">
                <ShareIcon className="mb-5 border border-gray-400 rounded-lg p-1 w-10 h-10" />
                <h3 className="font-semibold text-2xl text-left">Control the data you share</h3>
                <p className="text-justify">
                  Share only the information you want to share with your team or even external
                  recruiters. You are in control of your data!
                </p>
              </div>

              <div className="max-w-lg">
                <ChatIcon className="mb-5 border border-gray-400 rounded-lg p-1 w-10 h-10" />
                <h3 className="font-semibold text-2xl text-left">
                  Communicate within the platform
                </h3>
                <p className="text-justify">
                  Whether it is communicating internally with your team or communicating with the
                  candidate, you do it all within the platform without ever leaving it.
                </p>
              </div>

              <div className="max-w-lg">
                <EyeIcon className="mb-5 border border-gray-400 rounded-lg p-1 w-10 h-10" />
                <h3 className="font-semibold text-2xl text-left">
                  All the information at a glance
                </h3>
                <p className="text-justify">
                  When you use an Applicant Tracking System and Recruiting Software, all the
                  information regarding your company's hiring is at one place and not scattered
                  across various tools.
                </p>
              </div>
            </div>
          </section>

          {/* <div className="mt-8 mb-4 w-full flex items-center justify-center">
            <span className="text-xl lg:text-2xl text-black font-bold flex items-center justify-center space-x-2">
              Add multiple companies and easily switch between them:
            </span>
          </div>
          <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompSwitchHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-switch.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:block md:hidden lg:hidden smCompSwitchHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-switch.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:block lg:hidden mdCompSwitchHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-switch.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:hidden lg:block lgCompSwitchHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-switch.webp"
              layout="fill"
              objectFit="contain"
            />
          </div> */}

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col-reverse space-y-reverse space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-2/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-members.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-members.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-members.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/company-members.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/3">
                <p className="text-xl font-bold flex items-center justify-center">
                  Effortlessly collaborate with your team:
                </p>
                <p className="mt-5 text-justify">
                  Team collaboration is very important while making important Hiring Decisions.
                  Hire.win allows you to invite as many internal or external team members as you
                  need. Pay $29/month flat for our Recruiter Plan and invite your entire Hiring
                  Team. We don't charge you on per user basis as most other recruiting softwares do!
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-1/3">
                <p className="text-xl font-bold flex items-center justify-center">Jobs Overview:</p>
                <p className="mt-5 text-justify">
                  View all your jobs at a glance and know how many candidates are active across your
                  Hiring Stages. The Jobs Overview page helps hiring managers prioritise work by
                  having information about all the jobs at a glance on one single page!
                </p>
              </div>
              <div className="w-full lg:w-2/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/jobs-overview.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/jobs-overview.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/jobs-overview.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/jobs-overview.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-xl bg-black text-white lg:px-48 md:px-12 px-4 py-14 flex flex-col items-center">
            <div>
              <h2 className="text-3xl bg-left-bottom bg-no-repeat pb-8 px-16 mb-8 bg-underline2 bg-100%">
                How to create an Instant Careers Page?
              </h2>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  1
                </div>
                <h3 className="font-medium text-xl mb-2">Sign Up</h3>
                <p className="text-center">
                  Your careers page will be instantly live after Sign Up!
                </p>
              </div>
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  2
                </div>
                <h3 className="font-medium text-xl mb-2">Create Job</h3>
                <p className="text-center font-montserrat">
                  Just enter a Job Title to create new job!
                </p>
              </div>
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  3
                </div>
                <h3 className="font-medium text-xl mb-2">Copy Job Post Link</h3>
                <p className="text-center">Copy the Job Post link and keep it handy.</p>
              </div>
              <div className="flex-1 mx-8 flex flex-col items-center my-4">
                <div className="border-2 rounded-full bg-gray-100 text-black h-12 w-12 flex justify-center items-center mb-3">
                  4
                </div>
                <h3 className="font-medium text-xl mb-2">Share your Job Post</h3>
                <p className="text-center">Share your job post & start receiving applicants.</p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col-reverse space-y-reverse space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-2/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/board.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/board.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/board.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgCompMembersHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/board.png"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/3">
                <p className="text-xl font-bold flex items-center justify-center">Board View:</p>
                <p className="mt-5 text-justify">
                  Need to quickly review the candidates across Hiring Stages? Use the Board View
                  from 3 different views that we provide including Table View, Candidate View &
                  Board View!
                </p>
              </div>
            </div>
          </section>

          {/* <div className="mt-8 mb-4 w-full flex items-center justify-center">
            <span className="text-xl lg:text-2xl text-black font-bold flex items-center justify-center space-x-2">
              Collaborating with team has never been so easier:
            </span>
          </div>
          <div className="w-full block sm:hidden md:hidden lg:hidden mobileCompMembersHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-members.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:block md:hidden lg:hidden smCompMembersHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-members.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:block lg:hidden mdCompMembersHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-members.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:hidden lg:block lgCompMembersHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/company-members.webp"
              layout="fill"
              objectFit="contain"
            />
          </div> */}

          <section className="mt-7 rounded-xl w-full bg-white flex items-center justify-center p-10">
            <div className="w-full flex flex-col-reverse space-y-reverse space-y-10 lg:flex-row lg:space-x-10 lg:space-y-0 items-center justify-center">
              <div className="w-full lg:w-1/2">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileCommentsHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/comments.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smCommentsHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/comments.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdCommentsHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/comments.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgCommentsHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/comments.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <p className="text-xl font-bold flex items-center justify-center">
                  Keep your team in the loop:
                </p>
                <p className="mt-5 text-justify">
                  Add comments and hear back from the hiring team about what they think about a
                  particular candidate. Let the entire Hiring Team stay in the loop!
                </p>
                <p className="mt-5 text-justify">
                  You can also see exactly what happened in each stage by switching between Scores,
                  Interviews, Comments & Emails for a particular stage.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-t-xl md:px-0 lg:px-12 xl:px-36 px-4 py-14 flex flex-col items-center bg-white md:-mb-20">
            <div>
              <h2 className="font-bold text-3xl bg-left-bottom bg-no-repeat px-16 bg-underline4 bg-100%">
                Who is Hire.win for?
              </h2>
            </div>
            <div className="flex w-full flex-col md:flex-row">
              <div className="flex-1 flex flex-col mx-6 shadow-2xl relative border bg-gradient-to-br from-indigo-50 to-fuchsia-50 rounded-2xl py-5 px-8 my-8 md:top-24">
                <h3 className="font-pt-serif font-bold text-2xl mb-4">Companies</h3>
                {/* <div className="font-bold text-2xl mb-4">
                  $25
                  <span className="font-normal text-base"> / month</span>
                </div> */}
                <p className="text-lg">
                  Companies of any size, small to big can use Hire.win to streamline their hiring
                  process. Along with internal hiring teams, companies can also add external
                  recruiters and control their roles & privileges.
                </p>
                {/* <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #1</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #2</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #3</p>
                </div> */}
                {/* <button className=" border-2 border-solid border-black rounded-xl text-lg py-3 mt-4">
                  Choose plan
                </button> */}
              </div>

              <div className="flex-1 flex flex-col mx-6 shadow-2xl relative border bg-gradient-to-b from-indigo-50 to-fuchsia-50 rounded-2xl py-5 px-8 my-8 md:top-12">
                <h3 className="font-pt-serif font-bold text-2xl mb-4">Staffing Agencies</h3>
                {/* <div className="font-bold text-2xl mb-4">
                  $40
                  <span className="font-normal text-base"> / month</span>
                </div> */}
                <p className="text-lg">
                  Staffing agencies deal with multiple companies and that's where Hire.win stands
                  out the most as it allows creating unlimited companies while still offering a flat
                  price of just $29/month.
                </p>
                {/* <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #1</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #2</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #3</p>
                </div> */}
                {/* <button className=" border-2 border-solid border-black rounded-xl text-lg py-3 mt-4">
                  Choose plan
                </button> */}
              </div>

              <div className="flex-1 flex flex-col mx-6 shadow-2xl relative border bg-gradient-to-bl from-indigo-50 to-fuchsia-50 rounded-2xl py-5 px-8 my-8 md:top-24">
                <h3 className="font-pt-serif font-bold text-2xl mb-4">Freelance Recruiters</h3>
                {/* <div className="font-bold text-2xl mb-4">
                  $50
                  <span className="font-normal text-base"> / month</span>
                </div> */}
                <p className="text-lg">
                  Freelance Recruiters mostly use Excel sheets for hiring. With the truly unlimited
                  "Recruiter" plan offered by Hire.win at a flat pricing model of $29/month,
                  freelance recruiters can now switch to ATS!
                </p>
                {/* <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #1</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #2</p>
                </div>
                <div className="flex">
                  <img src="dist/assets/logos/CheckedBox.svg" alt="" className="mr-1" />
                  <p>Benefit #3</p>
                </div> */}
                {/* <button className=" border-2 border-solid border-black rounded-xl text-lg py-3 mt-4">
                  Choose plan
                </button> */}
              </div>
            </div>
          </section>

          <section className="rounded-b-xl lg:px-48 md:px-12 px-4 py-14 flex flex-col items-start pt-8 md:pt-36 bg-black text-white">
            <div className="flex items-center justify-center">
              <svg
                width="206"
                height="123"
                viewBox="0 0 206 123"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="-mr-16 -mt-8 w-32"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M149.474 13.7401C159.468 14.1027 167.411 17.6816 175.354 21.7003C201.405 34.8974 210.117 55.3734 192.266 75.4946C164.507 106.698 99.8503 127.12 49.7135 117.695C38.61 115.618 23.5775 113.787 12.5594 103.644C2.30997 94.2122 2.73703 83.0001 7.43468 72.6199C12.2177 61.9771 21.4422 52.1818 28.7876 45.8854C60.9025 18.4142 125.218 -6.55342 183.383 6.6093C184.579 6.86291 185.775 6.42676 186.116 5.63519C186.458 4.84362 185.86 3.99482 184.749 3.74121C124.876 -9.80525 58.5106 15.6985 25.4562 43.9703C16.3172 51.8216 4.36019 64.9277 0.943718 78.488C-1.3624 87.7561 0.26009 97.2302 9.14292 105.472C20.8443 116.277 36.8165 118.393 48.6033 120.605C100.363 130.339 167.24 109.321 195.853 77.094C215.07 55.4674 205.846 33.4384 177.831 19.2533C169.29 14.8931 160.578 11.125 149.73 10.7322C148.535 10.6894 147.51 11.3286 147.51 12.1587C147.425 12.9888 148.364 13.6973 149.474 13.7401Z"
                  fill="white"
                />
              </svg>
              <h2 className="-ml-24 text-3xl bg-left-bottom bg-no-repeat pb-8 px-16 mb-8 p-10 bg-100%">
                FAQ
              </h2>
            </div>

            <div className="w-full py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium mr-auto">
                  Can I customise my Careers Page created with Hire.win?
                </div>
                {/* <ChevronRightIcon className="w-6 h-6" /> */}
              </div>
              <div className="mt-4 text-left text-sm font-extralight pb-4">
                Yes, you can personalise your careers page using Hire.win, by including your company
                logo, company description, changing the theme to match your branding and customising
                the job application form.
              </div>
            </div>
            <hr className="w-full bg-white" />

            <div className="w-full py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium mr-auto">
                  Is Hire.win a Careers Page Builder or an Applicant Tracking System?
                </div>
                {/* <ChevronRightIcon className="w-6 h-6" /> */}
              </div>
              <div className="mt-4 text-left text-sm font-extralight pb-4">
                Hire.win is primarily an Instant Careers Page provider which also gives you a
                powerful Applicant Tracking Dashboard to track and interview the applicants along
                with your entire Hiring Team.
              </div>
            </div>
            <hr className="w-full bg-white" />

            <div className="w-full py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium mr-auto">Does Hire.win have a Free Plan?</div>
                {/* <ChevronRightIcon className="w-6 h-6" /> */}
              </div>
              <div className="mt-4 text-left text-sm font-extralight pb-4">
                Yes! Hire.win's free plan offers you 3 active jobs on your careers page and
                essential applicant tracking features.
              </div>
            </div>
            <hr className="w-full bg-white" />

            <div className="w-full py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium mr-auto">
                  What is the meaning of Flat Pricing model that Hire.win offers?
                </div>
                {/* <ChevronRightIcon className="w-6 h-6" /> */}
              </div>
              <div className="mt-4 text-left text-sm font-extralight pb-4">
                Flat pricing model means, Hire.win doesn't charge you on per job or per user basis.
                You just pay the flat monthly fee and you get unlimited access to all the features
                where you can create unlimited jobs, unlimited companies and onboard unlimited
                Hiring Team Members.
              </div>
            </div>
            <hr className="w-full bg-white" />

            <div className="w-full py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium mr-auto">
                  How is Hire.win useful for staffing agencies and freelance recruiters?
                </div>
                {/* <ChevronRightIcon className="w-6 h-6" /> */}
              </div>
              <div className="mt-4 text-left text-sm font-extralight pb-4">
                Staffing agencies and freelance recruiters mostly deal with multiple companies.
                That's where Hire.win comes to help as it provides a flat pricing model where
                recruiters can create unlimited companies and unlimited jobs even while paying a
                flat monthly fee!
              </div>
            </div>
          </section>

          {/* <div className="mt-8 mb-4 w-full flex items-center justify-center">
            <span className="text-xl lg:text-2xl text-black font-bold flex items-center justify-center space-x-2">
              Keep your team in the loop:
            </span>
          </div>
          <div className="w-full block sm:hidden md:hidden lg:hidden mobileCommentsHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/comments.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:block md:hidden lg:hidden smCommentsHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/comments.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:block lg:hidden mdCommentsHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/comments.webp"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="w-full hidden sm:hidden md:hidden lg:block lgCommentsHeight relative">
            <Image
              priority={true}
              alt="job"
              src="/landing-screenshots/comments.webp"
              layout="fill"
              objectFit="contain"
            />
          </div> */}
        </section>
      </div>

      <div className="mt-16 w-full flex items-center justify-center">
        <Link href={Routes.Pricing()}>
          <a className="hover:underline text-center text-xl lg:text-2xl text-black font-bold flex items-center justify-center space-x-2">
            {/* And a lot more features... click to read them all, along with our pricing! */}
            There's a lot more to talk about.. know our pricing and what you get!
          </a>
        </Link>
      </div>

      {/* <div className="mt-3 text-xl w-full flex items-center justify-center">
        <p>Or, directly explore them by quickly signing up...</p>
      </div> */}

      {/* Uncomment this once you want to provide google signup */}
      {/* <div className="w-full flex items-center justify-center mt-8">
        <div className="w-full sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 bg-white rounded-xl p-4">
          <div className="w-full">
            <Form
              noFormatting={true}
              onSubmit={async () => {
                router.push(Routes.EmailSignupPage({ email }))
              }}
            >
              <div className="w-full flex h-10 items-center justify-center">
                <input
                  name="email"
                  type="email"
                  required={true}
                  className="w-full h-full rounded-l border-fuchsia-600"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e?.target?.value || "")
                  }}
                />
                <button
                  type="submit"
                  className="w-fit h-full rounded-r text-white text-lg bg-fuchsia-600 hover:bg-fuchsia-700 px-3 py-1"
                >
                  <span className="whitespace-nowrap text-sm sm:text-base">Sign up free!</span>
                </button>
              </div>
            </Form>

            <a
              href={`/api/auth/google?redirectUrl=${
                router.query.next ? router.query.next : Routes.JobsHome().pathname
              }`}
            >
              <button className="w-full px-4 py-1 rounded bg-white text-neutral-600 border border-gray-300 hover:bg-gray-50 mt-4 h-10">
                <div className="flex items-center justify-between">
                  <Image height={20} width={20} src="/GoogleLogo.png" />
                  <span className="w-full text-center">Sign up with Google</span>
                </div>
              </button>
            </a>
          </div>
        </div>
      </div> */}

      <style jsx>{`
        .growing-underline {
          display: block;
          position: relative;
          padding: 0.2em 0;
          overflow: hidden;
        }

        .growing-underline::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0.1em;
          background-color: black;
          transition: opacity 300ms, transform 300ms;
          opacity: 1;
          transform: translate3d(-100%, 0, 0);
        }

        .growing-underline:hover::after,
        .growing-underline:focus::after {
          transform: translate3d(0, 0, 0);
        }

        .mobileCandidateHeight {
          height: 200px;
        }
        .smCandidateHeight {
          height: 300px;
        }
        .mdCandidateHeight {
          height: 400px;
        }
        .lgCandidateHeight {
          height: 600px;
        }

        .mobileInterviewSchHeight {
          height: 300px;
        }
        .smInterviewSchHeight {
          height: 400px;
        }
        .mdInterviewSchHeight {
          height: 500px;
        }
        .lgInterviewSchHeight {
          height: 600px;
        }

        .mobileCompSwitchHeight {
          height: 300px;
        }
        .smCompSwitchHeight {
          height: 300px;
        }
        .mdCompSwitchHeight {
          height: 300px;
        }
        .lgCompSwitchHeight {
          height: 300px;
        }

        .mobileCompMembersHeight {
          height: 200px;
        }
        .smCompMembersHeight {
          height: 200px;
        }
        .mdCompMembersHeight {
          height: 300px;
        }
        .lgCompMembersHeight {
          height: 300px;
        }

        .mobileCommentsHeight {
          height: 500px;
        }
        .smCommentsHeight {
          height: 500px;
        }
        .mdCommentsHeight {
          height: 600px;
        }
        .lgCommentsHeight {
          height: 600px;
        }

        .mobileJobsOverviewHeight {
          height: 110px;
        }
        .smJobsOverviewHeight {
          height: 220px;
        }
        .mdJobsOverviewHeight {
          height: 300px;
        }
        .lgJobsOverviewHeight {
          height: 300px;
        }

        .mobileScoresCommentsHeight {
          height: 500px;
        }
        .smScoresCommentsHeight {
          height: 400px;
        }
        .mdScoresCommentsHeight {
          height: 400px;
        }
        .lgScoresCommentsHeight {
          height: 500px;
        }

        .mobileInterviewsEmailsHeight {
          height: 600px;
        }
        .smInterviewsEmailsHeight {
          height: 500px;
        }
        .mdInterviewsEmailsHeight {
          height: 500px;
        }
        .lgInterviewsEmailsHeight {
          height: 600px;
        }

        .mobileBoardHeight {
          height: 150px;
        }
        .smBoardHeight {
          height: 250px;
        }
        .mdBoardHeight {
          height: 350px;
        }
        .lgBoardHeight {
          height: 400px;
        }

        .mobileTableHeight {
          height: 170px;
        }
        .smTableHeight {
          height: 300px;
        }
        .mdTableHeight {
          height: 400px;
        }
        .lgTableHeight {
          height: 500px;
        }

        .mobileSchedulesHeight {
          height: 150px;
        }
        .smSchedulesHeight {
          height: 300px;
        }
        .mdSchedulesHeight {
          height: 300px;
        }
        .lgSchedulesHeight {
          height: 300px;
        }

        .mobileCalendarsHeight {
          height: 100px;
        }
        .smCalendarsHeight {
          height: 200px;
        }
        .mdCalendarsHeight {
          height: 300px;
        }
        .lgCalendarsHeight {
          height: 300px;
        }

        .mobileScheduleCalAssignHeight {
          height: 160px;
        }
        .smScheduleCalAssignHeight {
          height: 330px;
        }
        .mdScheduleCalAssignHeight {
          height: 300px;
        }
        .lgScheduleCalAssignHeight {
          height: 300px;
        }

        .mobileMembersHeight {
          height: 120px;
        }
        .smMembersHeight {
          height: 230px;
        }
        .mdMembersHeight {
          height: 200px;
        }
        .lgMembersHeight {
          height: 230px;
        }

        .mobileMemberAssignHeight {
          height: 140px;
        }
        .smMemberAssignHeight {
          height: 260px;
        }
        .mdMemberAssignHeight {
          height: 230px;
        }
        .lgMemberAssignHeight {
          height: 250px;
        }

        .mobileInterviewSchedulingHeight {
          height: 600px;
        }
        .smInterviewSchedulingHeight {
          height: 500px;
        }
        .mdInterviewSchedulingHeight {
          height: 500px;
        }
        .lgInterviewSchedulingHeight {
          height: 600px;
        }

        .mobileEmailTemplateHeight {
          height: 350px;
        }
        .smEmailTemplateHeight {
          height: 500px;
        }
        .mdEmailTemplateHeight {
          height: 500px;
        }
        .lgEmailTemplateHeight {
          height: 600px;
        }

        .mobileCandidatePoolsHeight {
          height: 100px;
        }
        .smCandidatePoolsHeight {
          height: 200px;
        }
        .mdCandidatePoolsHeight {
          height: 300px;
        }
        .lgCandidatePoolsHeight {
          height: 300px;
        }

        .mobileJobCategoriesHeight {
          height: 50px;
        }
        .smJobCategoriesHeight {
          height: 100px;
        }
        .mdJobCategoriesHeight {
          height: 300px;
        }
        .lgJobCategoriesHeight {
          height: 300px;
        }

        .mobileFormConfigHeight {
          height: 250px;
        }
        .smFormConfigHeight {
          height: 500px;
        }
        .mdFormConfigHeight {
          height: 500px;
        }
        .lgFormConfigHeight {
          height: 450px;
        }

        .mobileStagesConfigHeight {
          height: 320px;
        }
        .smStagesConfigHeight {
          height: 400px;
        }
        .mdStagesConfigHeight {
          height: 450px;
        }
        .lgStagesConfigHeight {
          height: 500px;
        }

        .mobileScoreCardConfigHeight {
          height: 230px;
        }
        .smScoreCardConfigHeight {
          height: 450px;
        }
        .mdScoreCardConfigHeight {
          height: 400px;
        }
        .lgScoreCardConfigHeight {
          height: 450px;
        }

        .mobileFileUploadHeight {
          height: 80px;
        }
        .smFileUploadHeight {
          height: 150px;
        }
        .mdFileUploadHeight {
          height: 250px;
        }
        .lgFileUploadHeight {
          height: 250px;
        }

        .mobileCandidateActivityHeight {
          height: 220px;
        }
        .smCandidateActivityHeight {
          height: 250px;
        }
        .mdCandidateActivityHeight {
          height: 250px;
        }
        .lgCandidateActivityHeight {
          height: 250px;
        }

        .mobilePrivateNotesHeight {
          height: 200px;
        }
        .smPrivateNotesHeight {
          height: 250px;
        }
        .mdPrivateNotesHeight {
          height: 250px;
        }
        .lgPrivateNotesHeight {
          height: 300px;
        }

        .mobileCareersPageHeight {
          height: 390px;
        }
        .smCareersPageHeight {
          height: 450px;
        }
        .mdCareersPageHeight {
          height: 500px;
        }
        .lgCareersPageHeight {
          height: 550px;
        }

        .mobileLogoHeight {
          height: 30px;
        }
        .smLogoHeight {
          height: 30px;
        }
        .mdLogoHeight {
          height: 30px;
        }
        .lgLogoHeight {
          height: 30px;
        }
      `}</style>
    </LandingLayout>
  )
}
