import {
  GetServerSidePropsContext,
  GetStaticPropsContext,
  Head,
  Image,
  invalidateQuery,
  Link,
  Routes,
  Script,
  useQuery,
} from "blitz"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import LogoBrand from "app/assets/LogoBrand"
import { Suspense, useEffect, useState } from "react"
import LandingLayout from "app/core/layouts/LandingLayout"
import LabeledToggleGroupField from "app/core/components/LabeledToggleGroupField"
import Form from "app/core/components/Form"
import { Currency, PlanFrequency } from "types"
import LocaleCurrency from "locale-currency"
import getPlansByCurrency from "app/plans/queries/getPlansByCurrency"
import getCurrencySymbol from "app/plans/utils/getCurrencySymbol"
import { getCalApi } from "@calcom/embed-react"
import { CheckIcon, ExternalLinkIcon, XIcon } from "@heroicons/react/outline"

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

const Plans = ({ selectedCurrency, selectedFrequency }) => {
  const [plans] = useQuery(getPlansByCurrency, { currency: selectedCurrency })
  useEffect(() => {
    invalidateQuery(getPlansByCurrency)
  }, [selectedCurrency])

  return (
    <>
      {plans.map((plan) => {
        return (
          <div
            key={plan.priceId}
            className="w-full pb-6"
            hidden={selectedFrequency !== plan.frequency}
          >
            <div className="w-full text-4xl font-bold text-center whitespace-nowrap">
              <span className="text-base">Flat</span> {plan.currencySymbol}
              {plan.pricePerMonth}
              <span className="text-base"> /month</span>
            </div>
            <div className="w-full text-base text-center">
              if paid {plan.frequency.toLowerCase()}
            </div>
          </div>
        )
      })}
    </>
  )
}

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

  const localeCurrency = LocaleCurrency.getCurrency(navigator.language || "en-US") || Currency.USD
  const [selectedCurrency, setSelectedCurrency] = useState(Currency[localeCurrency] || Currency.USD)

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

  return (
    <LandingLayout>
      <div className="h-full">
        <Script
          strategy="lazyOnload"
          src="https://embed.tawk.to/6364c8c8b0d6371309cd3d09/1gh0r0k2g"
        />
        <section className="text-center px-4">
          <h1 className="mb-4 text-2xl md:text-3xl lg:text-5xl font-black leading-tight">
            Redefining the way companies Hire
          </h1>
          <p className="leading-normal text-gray-800 text-base md:text-xl lg:text-2xl mb-8">
            An inclusive hiring suite that increases your {"team's"} hiring efficiency by at least
            3x!
          </p>
          {/* <h1 className="text-2xl md:text-3xl lg:text-5xl font-black leading-tight">
            Reimagining the way companies Hire!
          </h1>
          <p className="leading-normal text-neutral-800 text-sm md:text-xl lg:text-2xl mt-4 flex justify-center flex-wrap space-x-2">
            <span className="whitespace-nowrap">🔥 Careers page</span>
            <span className="whitespace-nowrap">🚀 Interview Scheduling</span>
            <span className="whitespace-nowrap">📧 Emails</span>
            <span className="whitespace-nowrap">✍🏻 Comments</span>
            <span className="whitespace-nowrap">⭐️ Score Cards</span>
            <span className="whitespace-nowrap">💼 & much more...</span>
            <span className="whitespace-nowrap">👨🏻‍💻 Hiring Stages</span>
            <span className="whitespace-nowrap">👨🏻‍🎓 Candidate Pools</span>{" "}
            <span className="whitespace-nowrap">💰 Flat pricing</span>{" "}
            Applicant Tracking, Collaborating, Interviewing & more!
            <span className="font-bold">One single platform</span> for Hiring Managers and
            Interviewers
          </p> */}

          {/* <div className="mt-10">
            <p className="leading-normal text-neutral-800 text-xl md:text-2xl lg:text-3xl">
              <span className="font-bold">One single platform</span> for your entire Hiring Team
            </p>
            <div className="flex items-center justify-center">
              <XIcon className="w-12 h-12 text-red-600" />
              <p className="text-neutral-700 text-md md:text-lg lg:text-2xl line-through">
                Excel Sheets + Google Forms + Microsoft Teams + Dropbox + Calendly + Emails
              </p>
            </div>
          </div> */}

          {/* <p className="text-md md:text-lg lg:text-2xl font-bold mt-10">
            Bring the power of ATS to your company, 100+ Companies have already done so!
          </p> */}

          {/* <p className="text-sm lg:text-lg mt-2">
            100+ Companies have already done so!
          </p> */}
          {/* <div className="flex items-center justify-center">
            <CheckIcon className="w-10 h-10 text-green-600" />
            <p className="text-2xl">hire.win</p>
          </div> */}

          {/* <h1 className="my-4 text-2xl lg:text-4xl font-black leading-tight">
            <Link href={Routes.Beta()}>
              <a className="hover:underline">30% off for 3 months - BETA30</a>
            </Link>
          </h1> */}

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

          <div className="mt-8">
            <Suspense fallback="Loading...">
              <BookADemoButton />
            </Suspense>
          </div>

          <div className="mt-8 flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-3 md:space-y-0 lg:space-y-0 md:space-x-3 lg:space-x-3">
            {/* <a
              href="https://www.producthunt.com/posts/hire-win?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-hire&#0045;win"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=356023&theme=light"
                alt="hire&#0046;win - Interviewing&#0032;Kit&#0032;with&#0032;careers&#0032;page | Product Hunt"
                className="w-48 md:w-56 lg:w-64"
              />
            </a> */}
            <a
              href="https://www.producthunt.com/products/hire-win?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-hire&#0045;win"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=356023&theme=light&period=daily"
                alt="hire&#0046;win - Interviewing&#0032;Kit&#0032;with&#0032;Careers&#0032;Page | Product Hunt"
                className="w-72"
                // style="width: 250px; height: 54px;"
                // width="250"
                // height="54"
              />
            </a>
            <Link prefetch={true} href={Routes.SignupPage()}>
              <a>
                {/* <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 hover:underline text-white font-extrabold rounded py-4 px-8 shadow-lg w-72 text-xl">
                  Start 14 days free trial
                </button> */}
                <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 hover:underline text-white font-extrabold rounded py-4 px-8 shadow-lg w-fit text-xl">
                  Get Early Access
                </button>
              </a>
            </Link>
            {/* <Link prefetch={true} href={Routes.LoginPage()}>
            <a className="inline-block mx-auto lg:mx-0 hover:underline bg-transparent text-neutral-600 font-extrabold py-2 lg:py-4 px-8">
              Login
            </a>
          </Link> */}
          </div>
        </section>

        <section id="customers" className="bg-white border-b px-4 py-4 mt-12">
          <div className="container mx-auto flex flex-wrap items-center justify-between pb-12">
            <h2 className="w-full my-2 text-xl font-black leading-tight text-center text-gray-800 lg:mt-8">
              Many companies are already streamlining their hiring process with hire.win
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-96 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            {/* <div className="w-full my-5 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <p className="text-neutral-700 text-md md:text-lg lg:text-2xl">Are you the next?</p>
              </div>
            </div> */}

            <div className="w-full flex items-center justify-center mt-10 space-x-10 px-8">
              <div className="w-1/3 sm:w-1/4">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/welfound-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/welfound-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/welfound-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/welfound-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-1/3 sm:w-1/4">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/variance-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/variance-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/variance-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/variance-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-1/3 sm:w-1/4">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/prompt-softech-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/prompt-softech-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/prompt-softech-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/prompt-softech-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block w-1/4">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex sm:hidden w-full items-center justify-center mt-10 space-x-10 px-8">
              <div className="w-1/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/primus-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-1/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/kcs-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/kcs-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/kcs-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/kcs-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="w-1/3">
                <div className="w-full block sm:hidden md:hidden lg:hidden mobileLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/arthentic-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:block md:hidden lg:hidden smLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/arthentic-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:block lg:hidden mdLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/arthentic-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="w-full hidden sm:hidden md:hidden lg:block lgLogoHeight relative">
                  <Image
                    priority={true}
                    alt="job"
                    src="/landing-screenshots/arthentic-logo.webp"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            </div>

            <div className="hidden w-full sm:flex justify-center mt-10 space-x-10 px-8 text-neutral-600 font-medium italic text-justify text-sm">
              <div className="w-1/4">
                {'"'}The simplest ATS we have ever used! Being in the recruiting industry ourselves,
                we truly value the product!{'"'}
              </div>
              <div className="w-1/4">
                {'"'}We are able to reduce repetitive processes like interview scheduling and hence
                reduce time to hire. Definitely recommend!{'"'}
              </div>
              <div className="w-1/4">
                {'"'}Not just the product but the people at hire.win are wonderful. They guys helped
                us migrate our data to their platform!{'"'}
              </div>
              <div className="w-1/4">
                {'"'}Our HR team is truly pleased with the software. They are finding incredible
                value after having used excel sheets for so long!{'"'}
              </div>
            </div>
          </div>
        </section>

        <section id="careers-page" className="mx-5 sm:mx-10">
          <h1 className="text-center pt-8 pb-4 font-bold text-xl lg:text-2xl">
            You get an auto-generated Careers Page with{" "}
            <span className="bg-yellow-300">customizable theme color</span>:
          </h1>
          <div className="w-full h-screen pb-8 rounded-lg drop-shadow-lg">
            <div className="w-full h-8 space-x-2 px-3 rounded-t-lg bg-neutral-100 flex justify-start items-center">
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
                    ? "https://hire.win/padason"
                    : "http://localhost:3000/padason"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 ml-auto text-neutral-500 hover:text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            <div className="bg-white border-t-0 w-full h-full rounded-b-lg">
              <iframe
                src={
                  process.env.NODE_ENV === "production"
                    ? "https://hire.win/padason"
                    : "http://localhost:3000/padason"
                }
                title="Careers Page"
                className="w-full h-full rounded-b-lg"
              ></iframe>
            </div>
          </div>
        </section>

        {/* <section id="hiring-suite" className="bg-white border-b px-4 py-4 mt-12">
          <div className="container mx-auto flex flex-wrap items-center justify-between pb-12">
            <h2 className="w-full my-2 text-xl font-black leading-tight text-center text-gray-800 lg:mt-8">
              Our Hiring Suite
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-48 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full my-5 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <XIcon className="w-12 h-12 text-red-600" />
                <p className="text-neutral-700 text-md md:text-lg lg:text-2xl line-through">
                  Excel Sheets + Google Forms + Microsoft Teams + Dropbox + Calendly + Emails
                </p>
              </div>
            </div>

            <p className="text-neutral-800 leading-loose text-sm md:text-xl lg:text-2xl mt-4 flex justify-center flex-wrap space-x-8">
              <span className="whitespace-nowrap leading-loose">🔥 Careers page</span>
              <span className="whitespace-nowrap leading-loose">👨🏻‍💻 Applicant Tracking</span>
              <span className="whitespace-nowrap leading-loose">🚀 Interview Scheduling</span>
              <span className="whitespace-nowrap leading-loose">📧 Emails</span>
              <span className="whitespace-nowrap leading-loose">🔖 Email Templates</span>
              <span className="whitespace-nowrap leading-loose">✍🏻 Messaging</span>
              <span className="whitespace-nowrap leading-loose">⭐️ Score Cards</span>
              <span className="whitespace-nowrap leading-loose">🕝 Candidate Timeline</span>
              <span className="whitespace-nowrap leading-loose">📝 Private Notes</span>
              <span className="whitespace-nowrap leading-loose">🪜 Hiring Stages</span>
              <span className="whitespace-nowrap leading-loose">📄 Job Application Form</span>
              <span className="whitespace-nowrap leading-loose">👨🏻‍🎓 Candidate Pools</span>
              <span className="whitespace-nowrap leading-loose">
                📆 Google & Outlook Calendar integration
              </span>
              <span className="whitespace-nowrap leading-loose">📮 Job posting to Google Jobs</span>
              <span className="whitespace-nowrap leading-loose">🗄️ Unlimited File Uploads</span>
              <span className="whitespace-nowrap leading-loose">🏷️ Job Categories</span>
              <span className="whitespace-nowrap leading-loose">💼 & much more...</span>
            </p>
          </div>
        </section> */}

        <section id="who-is-it-for" className="bg-gray-100 border-b px-4 py-8 mt-12">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Who is it for?
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full my-5 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <XIcon className="w-12 h-12 text-red-600" />
                <p className="text-neutral-700 text-md md:text-lg lg:text-2xl line-through">
                  Excel Sheets + Google Forms + Microsoft Teams + Dropbox + Calendly + Emails
                </p>
              </div>
            </div>

            <p className="w-full text-center text-lg italic text-neutral-700 pb-10">
              If you are using Excel Sheets and other supportive tools, you are going to love
              hire.win! We stay closer to the simplicity of sheets while giving you the power of a{" "}
              <span className="font-bold">full-fledged Applicant Tracking System (ATS)</span> 😎
            </p>

            <div className="flex flex-wrap">
              <div className="w-full sm:w-1/2 p-6">
                <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                  Companies actively hiring
                </h3>
                <p className="text-gray-600 mb-8 text-justify">
                  - With hire.win, you can onboard your entire hiring team and start creating and
                  sharing job posts. Your team can use our inclusive hiring suite to{" "}
                  <span className="font-bold">
                    track, interview, communicate, provide feedback, upload files & much more!
                  </span>
                  <br />
                  <br />- You will forget when you last shared your hr email address once you start
                  using hire.win! What {"you'll"} remember instead is the link to your
                  auto-generated careers page:{" "}
                  <span className="font-bold">hire.win/your-company</span> 🤩
                </p>
              </div>
              <div className="w-full sm:w-1/2 p-6">
                <svg
                  className="w-full sm:h-64 mx-auto"
                  viewBox="0 0 898.09814 398.74219"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M533.28931,505.37109H169.45093a18.5208,18.5208,0,0,1-18.5-18.5V264.71729a14.104,14.104,0,0,1,14.08789-14.08838H537.49219a14.31325,14.31325,0,0,1,14.29712,14.29736V486.87109A18.5208,18.5208,0,0,1,533.28931,505.37109Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#fff"
                  />
                  <path
                    d="M533.28931,505.37109H169.45093a18.5208,18.5208,0,0,1-18.5-18.5V264.71729a14.104,14.104,0,0,1,14.08789-14.08838H537.49219a14.31325,14.31325,0,0,1,14.29712,14.29736V486.87109A18.5208,18.5208,0,0,1,533.28931,505.37109ZM165.03882,254.62891a10.09971,10.09971,0,0,0-10.08789,10.08838v222.1538a14.51653,14.51653,0,0,0,14.5,14.5H533.28931a14.51653,14.51653,0,0,0,14.5-14.5V264.92627a10.30867,10.30867,0,0,0-10.29712-10.29736Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M317.06236,449.12491h-109.02a11.01778,11.01778,0,0,1-10.905-9.563,9.97492,9.97492,0,0,1-.095-1.437v-120.25a11.01245,11.01245,0,0,1,11-11h109.02a11.01245,11.01245,0,0,1,11,11v120.25A11.01245,11.01245,0,0,1,317.06236,449.12491Zm-109.02-136.25a5.00573,5.00573,0,0,0-5,5v120.25a4.26094,4.26094,0,0,0,.03809.61475,5.01529,5.01529,0,0,0,4.96191,4.38525h109.02a5.00573,5.00573,0,0,0,5-5v-120.25a5.00573,5.00573,0,0,0-5-5Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M497.69782,410.02481h-132a8,8,0,1,1,0-16h132a8,8,0,0,1,0,16Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M437.69782,376.02481h-72a8,8,0,1,1,0-16h72a8,8,0,0,1,0,16Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M298.49876,374.69494c0,17.67311-16.3416,15-36.5,15s-36.5,2.67311-36.5-15,7.98246-49,36.5-49C291.49876,325.69494,298.49876,357.02183,298.49876,374.69494Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <path
                    d="M299.9751,404.43872a9.06449,9.06449,0,0,0-3.96-4.84,7.8666,7.8666,0,0,0-1.12012-.57,9.05434,9.05434,0,0,0-11.98,11.47l14.54,33.05H316.605Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M236.5249,406.23871a9.05548,9.05548,0,0,0-12.48974,5.17l-13.54,31.85a7.8764,7.8764,0,0,0,2.12988.29h16.99023l11.4795-26.08A9.037,9.037,0,0,0,236.5249,406.23871Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <circle cx="110.92579" cy="114.47548" r="24.56103" fill="#ffb8b8" />
                  <path
                    d="M296.44482,399.98871c-.13964-.13-.27978-.27-.42968-.39a15.95256,15.95256,0,0,0-12.75-3.97l-45.26026,5.73a16.06191,16.06191,0,0,0-14.02,17.44c.62012,6.98,1.62012,15.79,3.22022,24.75h71.5l2.62988-30.56A16.035,16.035,0,0,0,296.44482,399.98871Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M233.49876,362.69492v0h9.71436l4.28564-12,.85694,12h4.64306l2.5-7,.5,7h34.5v0a26,26,0,0,0-26-26h-5A26,26,0,0,0,233.49876,362.69492Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <path
                    d="M648.21069,486.87109V264.92627a14.31325,14.31325,0,0,1,14.29712-14.29736h372.45337a14.104,14.104,0,0,1,14.08789,14.08838v222.1538a18.5208,18.5208,0,0,1-18.5,18.5H666.71069A18.5208,18.5208,0,0,1,648.21069,486.87109Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#fff"
                  />
                  <path
                    d="M648.21069,486.87109V264.92627a14.31325,14.31325,0,0,1,14.29712-14.29736h372.45337a14.104,14.104,0,0,1,14.08789,14.08838v222.1538a18.5208,18.5208,0,0,1-18.5,18.5H666.71069A18.5208,18.5208,0,0,1,648.21069,486.87109Zm14.29712-232.24218a10.30867,10.30867,0,0,0-10.29712,10.29736V486.87109a14.51653,14.51653,0,0,0,14.5,14.5h363.83838a14.51653,14.51653,0,0,0,14.5-14.5V264.71729a10.09971,10.09971,0,0,0-10.08789-10.08838Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M871.93764,438.12491v-120.25a11.01245,11.01245,0,0,1,11-11h109.02a11.01245,11.01245,0,0,1,11,11v120.25a9.97492,9.97492,0,0,1-.095,1.437,11.01778,11.01778,0,0,1-10.905,9.563h-109.02A11.01245,11.01245,0,0,1,871.93764,438.12491Zm11-125.25a5.00573,5.00573,0,0,0-5,5v120.25a5.00573,5.00573,0,0,0,5,5h109.02a5.01529,5.01529,0,0,0,4.96191-4.38525,4.26094,4.26094,0,0,0,.03809-.61475v-120.25a5.00573,5.00573,0,0,0-5-5Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M694.30218,402.02481a8.00917,8.00917,0,0,1,8-8h132a8,8,0,1,1,0,16h-132A8.00916,8.00916,0,0,1,694.30218,402.02481Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M694.30218,368.02481a8.00917,8.00917,0,0,1,8-8h72a8,8,0,1,1,0,16h-72A8.00916,8.00916,0,0,1,694.30218,368.02481Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M910.50547,353.60478c7.01074,13.78357,12.536,28,28,28a28,28,0,0,0,0-56C922.78965,325.408,897.45664,327.94938,910.50547,353.60478Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <circle cx="786.17659" cy="106.96012" r="24.56103" fill="#a0616a" />
                  <path
                    d="M970.65967,402.35876a42.79043,42.79043,0,0,0-5.1499-4.76,41.72508,41.72508,0,0,0-28.39014-8.8q-.61451.02994-1.23.09a41.82491,41.82491,0,0,0-30.15967,16.64,42.34634,42.34634,0,0,0-7.52,34.15c.27,1.25.50977,2.51.73975,3.77h81.41992l.93994-6.3A42.09424,42.09424,0,0,0,970.65967,402.35876Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M983.12988,408.92877a14.25389,14.25389,0,0,0-13.93017-11.8c-.12989,0-.27.01-.39991.01a14.34716,14.34716,0,0,0-3.29.46,14.19973,14.19973,0,0,0-10.06006,17.43l7.68994,28.42H989.02Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M926.17969,401.47876a14.17548,14.17548,0,0,0-4.08985-4.88,13.76889,13.76889,0,0,0-4.02-2.1,13.35784,13.35784,0,0,0-1.81005-.48,14.2719,14.2719,0,0,0-16.1001,9.24l-14.07959,40.19H912.7998l13.62989-29.56A14.091,14.091,0,0,0,926.17969,401.47876Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M911.06442,343.70843a33.40479,33.40479,0,0,0,19.09068,5.89985,20.47074,20.47074,0,0,1-8.11361,3.338,67.35879,67.35879,0,0,0,27.514.1546,17.80739,17.80739,0,0,0,5.75977-1.97824,7.28916,7.28916,0,0,0,3.55521-4.7547c.60365-3.44852-2.08347-6.58158-4.876-8.69308A35.96735,35.96735,0,0,0,923.77,331.63519c-3.37627.87272-6.75853,2.34726-8.9515,5.05866s-2.84258,6.8915-.75322,9.68352Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <path
                    d="M781.91919,649.37109H418.08081a18.5208,18.5208,0,0,1-18.5-18.5V408.71729a14.104,14.104,0,0,1,14.08789-14.08838H786.12207a14.31325,14.31325,0,0,1,14.29712,14.29736V630.87109A18.5208,18.5208,0,0,1,781.91919,649.37109Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#fff"
                  />
                  <path
                    d="M781.91919,649.37109H418.08081a18.5208,18.5208,0,0,1-18.5-18.5V408.71729a14.104,14.104,0,0,1,14.08789-14.08838H786.12207a14.31325,14.31325,0,0,1,14.29712,14.29736V630.87109A18.5208,18.5208,0,0,1,781.91919,649.37109ZM413.6687,398.62891a10.09971,10.09971,0,0,0-10.08789,10.08838v222.1538a14.51653,14.51653,0,0,0,14.5,14.5H781.91919a14.51653,14.51653,0,0,0,14.5-14.5V408.92627a10.30867,10.30867,0,0,0-10.29712-10.29736Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M565.69224,593.12491h-109.02a11.01778,11.01778,0,0,1-10.905-9.563,9.97635,9.97635,0,0,1-.095-1.437v-120.25a11.01245,11.01245,0,0,1,11-11h109.02a11.01245,11.01245,0,0,1,11,11v120.25A11.01245,11.01245,0,0,1,565.69224,593.12491Zm-109.02-136.25a5.00573,5.00573,0,0,0-5,5v120.25a4.26238,4.26238,0,0,0,.03809.61475,5.01529,5.01529,0,0,0,4.96191,4.38525h109.02a5.00573,5.00573,0,0,0,5-5v-120.25a5.00573,5.00573,0,0,0-5-5Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M509.59925,472.85881c-7.097-3.30156-15.81044-4.38389-23.03182-1.316s-12.14452,10.93153-9.80947,17.89082c1.05869,3.15525,3.46989,6.25836,2.53051,9.445-.72307,2.45284-3.24546,4.07226-5.72259,5.22372s-5.18694,2.11951-6.97842,4.06155-2.16509,5.28532.07286,6.79138c.73731.49619,1.65885.7315,2.37375,1.25437a3.772,3.772,0,0,1,1.16432,4.2222,8.89327,8.89327,0,0,1-2.85084,3.75065c-2.54053,2.19094-5.89807,4.69849-5.10925,7.80873a5.47829,5.47829,0,0,0,3.697,3.45788,18.36721,18.36721,0,0,0,5.42688.71627l74.96621,2.36156a28.42291,28.42291,0,0,0,7.40167-.41344,8.76188,8.76188,0,0,0,5.81294-3.905c1.43559-2.65728.4931-5.93058-1.2798-8.41187s-4.282-4.43862-6.35525-6.71708-3.76948-5.12271-3.404-8.06748c.29256-2.35732,1.84718-4.3947,2.96321-6.5366s1.76427-4.81848.31886-6.78894c-2.03678-2.77664-6.92687-2.5255-9.24284-5.11283-1.74777-1.95255-1.41027-4.76345-1.584-7.28134-.418-6.05656-4.61117-11.77645-10.58027-14.43257a20.83058,20.83058,0,0,0-18.95323,1.2908Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <circle cx="361.4221" cy="262.75611" r="24.56103" fill="#a0616a" />
                  <path
                    d="M544.61935,569.66483a23.78832,23.78832,0,0,0-12.68018-20.9c-.30957-.17-.62988-.32-.94971-.47a23.61949,23.61949,0,0,0-8.81005-2.24l-23.37989-1.31a23.60045,23.60045,0,0,0-9.70019,1.49,22.6607,22.6607,0,0,0-2.21.96,23.53962,23.53962,0,0,0-6.12012,4.35,23.80582,23.80582,0,0,0-7.06006,17.94l.42041,9.91,2.93994,7.63h65.36963a17.95992,17.95992,0,0,0,2.1001-3.18A15.91881,15.91881,0,0,0,544.61935,569.66483Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M543.01925,556.52481a14.14311,14.14311,0,0,0-4.83984-5.74,14.45108,14.45108,0,0,0-5.01026-2.18,14.66536,14.66536,0,0,0-2.17969-.31,14.087,14.087,0,0,0-4.30029.37,14.2736,14.2736,0,0,0-9.18994,20.49l8.99023,17.02.44971.85H557.1296Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M493.60909,547.65482a14.34142,14.34142,0,0,0-4.50976-1.42,13.89783,13.89783,0,0,0-3.52979-.05,14.25733,14.25733,0,0,0-12.36035,11.29l-6.08984,29.55h23.81982l4.4502-1.81994,5.54-21.26A14.31954,14.31954,0,0,0,493.60909,547.65482Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#3f3d56"
                  />
                  <path
                    d="M487.24635,509.89315c7.75642-.62285,14.19623-8.37141,13.38973-16.1109A13.00908,13.00908,0,0,0,511.77729,507.028c3.55787.392,7.4584-.68444,10.55524,1.11048,3.43,1.988,4.52758,6.81577,8.10091,8.53282,3.45255,1.659,7.8377-.60361,9.54345-4.03331s1.28714-7.5502.1567-11.21a31.65249,31.65249,0,0,0-52.68951-12.97513c-3.26143,3.28049-5.851,7.46146-6.271,12.06822s1.71705,9.60534,5.85416,11.67485Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#2f2e41"
                  />
                  <path
                    d="M746.3277,554.02481h-132a8,8,0,1,1,0-16h132a8,8,0,0,1,0,16Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M686.3277,520.02481h-72a8,8,0,1,1,0-16h72a8,8,0,0,1,0,16Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#6c63ff"
                  />
                  <path
                    d="M724.96059,578.44873a26.378,26.378,0,0,0-.0002,52.75591h.0002a26.378,26.378,0,0,0,0-52.75591Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#6c63ff"
                  />
                  <path
                    id="f276b720-7c73-4755-84a7-b208d54eb1fc-96"
                    data-name="Path 395"
                    d="M722.45772,615.78162a3.20123,3.20123,0,0,1-1.9259-.64006l-.03446-.02584-7.25395-5.549a3.22361,3.22361,0,0,1,3.92261-5.11661l4.69853,3.60305,11.10288-14.48493a3.22224,3.22224,0,0,1,4.51774-.59673l.00093.0007-.0689.09568.07077-.09568a3.22613,3.22613,0,0,1,.596,4.51864l-13.05941,17.02985a3.22419,3.22419,0,0,1-2.564,1.25715Z"
                    transform="translate(-150.95093 -250.62891)"
                    fill="#fff"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap flex-col-reverse sm:flex-row">
              <div className="w-full sm:w-1/2 p-6 mt-6">
                <svg
                  className="w-5/6 sm:h-64 mx-auto"
                  viewBox="0 0 732.19786 575.59415"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <rect
                      x="88.31943"
                      y="73.52792"
                      width="95.62359"
                      height="90.6776"
                      transform="translate(-12.96953 16.73948) rotate(-6.71736)"
                      fill="#2f2e41"
                    />
                    <circle cx="129.77326" cy="73.53453" r="46.62398" fill="#ffb6b6" />
                    <path
                      d="M99.03341,1.22034h.00008c-29.05469,8.06607-26.34874,18.89664-35.15236,25.72128-15.51012,12.02353-18.67636,41.84179-7.60228,59.96799,2.95883,4.84312,8.74844,11.24349,7.22634,19.06984-1.16854,6.00787-6.10076,10.05178-7.02968,10.78839-7.60336,6.02855-2.95686-.62528-6.16383,4.04613-3.53971,5.15617,3.57434,11.0127,.67677,19.84121-2.56862,7.8268-9.73949,8.0363-10.11161,12.81153-.64091,8.22292,19.48148,22.2348,38.72188,18.68042,17.13102-3.16463,28.23715-19.2708,30.91338-33.52235,1.79253-9.54671,1.16755-25.53096-7.13171-32.36164-1.16407-.95801-4.30644-3.23996-7.51371-7.41543-2.538-3.30428-5.87931-7.65394-4.62471-11.07584,1.33645-3.64554,6.48778-2.41635,9.2456-6.06922,3.74022-4.95387-2.21238-11.87816-2.31418-19.64839-.17205-13.15743,16.40269-30.95883,36.21121-30.82624,22.47135,.15027,33.43101,23.27567,34.58128,25.80842,2.38416,5.24944,2.97096,10.5306,4.14442,21.0929,1.68442,15.15769,2.73968,24.65812-.86227,34.96319-5.18075,14.82173-14.06278,14.33248-15.31113,25.04441-1.94595,16.70153,18.13237,30.88011,20.42352,32.45619,16.98631,11.68365,40.71881,13.00295,43.92149,6.44748,2.8858-5.90735-13.6288-12.62274-15.12563-29.75999-1.29732-14.85098,10.1474-20.77267,6.35285-30.62969-4.17655-10.85036-19.13236-6.50143-27.06749-18.39297-7.40658-11.0996,2.90841-18.95684-1.73936-42.95719-.98335-5.07699-4.32292-19.58714-15.51136-33.03474-4.92906-5.9244-9.94215-11.94973-18.30218-14.44513-9.35887-2.79357-35.48598-10.86732-50.85513-6.60068l-.00018,.00013Z"
                      fill="#2f2e41"
                    />
                    <path
                      d="M84.20655,44.46853c2.39547,9.99766,18.20607,13.17328,24.85159,13.67373,2.81458,.21205,12.32589,.92817,21.09289-4.14435,3.24035-1.875,4.32733-3.35345,7.80109-4.23898,4.70304-1.1988,7.32434,.33495,15.12198,1.53905,8.67083,1.33895,13.00647,2.00854,14.92914-.09828,3.14309-3.44391-.7139-13.04515-5.58893-19.26266-9.01408-11.49655-23.29574-13.7032-29.95657-14.73258-7.61007-1.17595-23.05312-3.56235-35.82913,5.88005-1.70816,1.2624-14.85584,11.22628-12.42213,21.384h.00008Z"
                      fill="#2f2e41"
                    />
                  </g>
                  <g>
                    <path
                      d="M717.90045,224.12948c.21576-2.3636-5.30884-3.66286-5.00293-5.72829,.30475-2.05801,5.896-1.48431,11.91492-5.06033,1.08545-.64487,7.92548-4.7088,7.35126-7.90527-1.08838-6.05887-27.85583-3.67188-30.22693-12.5063-.52045-1.93883,.07886-4.62405-1.33679-10.71202-.56323-2.42194-1.05029-3.68388-2.10046-4.10532-1.49011-.59801-2.81219,1.01878-6.56848,3.36079-5.63324,3.51231-6.61609,2.34305-10.67377,5.4613-3.01221,2.31483-4.05255,4.175-5.32727,3.76173-1.80389-.58476-.8855-4.68723-2.94067-5.74741-2.09729-1.08182-5.8761,1.73445-8.21063,4.20097-4.38098,4.6286-4.94495,9.36638-6.47278,13.67188-1.66034,4.67896-5.23529,11.035-13.86224,17.45273l-78.63861,54.1935c16.53943-10.82874,62.75952-39.87575,80.73914-50.08818,5.19037-2.94807,10.63525-5.80794,16.45941-4.27756,5.6073,1.47334,10.89056,6.83844,19.89679,10.53979,1.05182,.43233,3.99493,1.59828,5.3656,.36266,1.13318-1.0215,.15924-2.75397,1.20288-3.72345,1.3999-1.30043,4.28845,.76111,9.08905,1.56558,3.38513,.56721,6.00012,.22113,8.24884-.07655,.67798-.08974,10.80664-1.4938,11.09381-4.64024l-.00006-.00005-.00006,.00003Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M588.30463,188.84675c-1.09778-.7879-3.32947,1.54877-4.25494,.80267-.92218-.74338,.97266-3.32208,.95422-7.30798-.00336-.7188-.02435-5.24854-1.75891-5.88898-3.28772-1.214-9.83948,12.61237-14.85962,11.22711-1.10175-.30397-2.24677-1.37291-5.64325-2.43462-1.3512-.42236-2.11115-.54742-2.62097-.15359-.72345,.55881-.3114,1.67422-.24573,4.19351,.09851,3.77824-.75897,3.92326-.39929,6.81448,.26703,2.14632,.87982,3.19366,.30914,3.70004-.8075,.71663-2.55603-.91782-3.66931-.21501-1.13611,.71722-.84412,3.38445-.30713,5.24191,1.00769,3.48572,3.17029,5.12952,4.84265,7.12167,1.81738,2.16493,3.90552,5.75349,4.56616,11.83939l3.90875,54.23291c-.54266-11.2421-1.46313-42.30823-1.28778-54.07935,.0506-3.39809,.21802-6.89561,2.64966-9.31261,2.34106-2.32701,6.4986-3.37202,10.91388-6.7244,.51569-.39151,1.93713-1.49962,1.7262-2.52882-.17444-.85089-1.30573-.87273-1.48041-1.66473-.23431-1.06232,1.61096-1.88522,3.39087-4.00928,1.25513-1.49777,1.83972-2.88107,2.34253-4.07069,.15155-.35864,2.38489-5.73497,.92346-6.78378l-.00006,.00011-.00012,.00003Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M606.5979,209.55146l3.60046-6.36517,.62433-.22833c2.88788-1.0551,5.05707-2.55656,6.44995-4.46378,.2215-.30318,.42743-.61768,.63739-.93784,.83173-1.26933,1.8653-2.84744,3.94904-4.05124,1.16425-.66927,4.08008-2.05931,5.75934-.41121,.45605,.43826,.6712,.94907,.76514,1.43283,.09198-.03735,.18542-.07372,.28583-.11369,1.23505-.47079,1.97754-.51826,2.69275-.5639,.54968-.03542,1.11694-.07109,2.17609-.36165,.4646-.1273,.84845-.25673,1.17157-.3651,.97919-.32669,2.20227-.67622,3.315,.1505,1.15863,.92493,1.06903,2.37172,1.01038,3.32982-.104,1.70924-.37805,2.79738-.56012,3.51892-.06708,.26335-.1413,.56047-.14581,.6655-.02472,.84836,3.50293,2.59074,4.8269,3.25412,2.98059,1.4808,5.55969,2.76216,5.29425,5.12558-.18854,1.69139-1.841,2.91269-5.04828,3.72372-.99878,.25194-1.92053,.32565-2.70221,.3405,.23834,.5536,.33588,1.20889,.05194,1.92174h0c-.67438,1.68639-2.93585,2.22885-6.72412,1.61897-.94244-.14914-2.20807-.35446-3.67126-1.07094-.68878-.33809-1.25885-.71156-1.74109-1.03879-.20746,.26572-.48529,.51512-.8717,.69899-1.13556,.54279-2.45905,.23489-3.91455-.97415-1.61932-1.30589-2.77289-2.62991-3.79175-3.7959-.89069-1.01688-1.66022-1.88988-2.4173-2.36403-1.41724-.86081-3.22479-.53568-5.44177-.02168l-5.58044,1.34628-.00006-.00003,.00012-.00005Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M635.02198,176.70832l-7.07025-1.86821-.37921-.54599c-1.75311-2.52583-3.75568-4.24323-5.9538-5.10677-.34949-.13736-.70587-.25674-1.06885-.37866-1.43878-.4826-3.22748-1.08205-4.92041-2.7923-.94275-.95641-3.02686-3.42432-1.85864-5.46667,.30823-.55228,.7478-.88998,1.19189-1.10355-.05951-.07951-.11841-.16068-.1825-.24763-.76868-1.07526-1.00293-1.78143-1.22845-2.46169-.17371-.52277-.35211-1.06241-.90179-2.01321-.24103-.4171-.46356-.75555-.65033-1.04063-.56439-.86429-1.21271-1.95876-.69525-3.24478,.60077-1.35532,2.02301-1.63565,2.96466-1.82196,1.67975-.33292,2.80182-.34387,3.5459-.35078,.27173-.00191,.578-.00549,.68073-.02776,.8269-.19125,1.61749-4.04549,1.9234-5.49445,.67633-3.25868,1.2616-6.07848,3.61505-6.42117,1.6839-.24661,3.28442,1.04199,4.88245,3.93867,.49707,.90218,.80219,1.7751,1.01477,2.5275,.47504-.37096,1.08417-.63159,1.8457-.53767h0c1.80231,.22459,2.90063,2.27448,3.27161,6.09355,.09479,.94943,.21722,2.22575-.10468,3.82281-.15234,.752-.36902,1.39815-.56323,1.94765,.30963,.13326,.62134,.33879,.89728,.66592,.81305,.96072,.85095,2.31905,.05066,4.03362-.85242,1.89761-1.84058,3.34926-2.70996,4.63055-.75775,1.11948-1.40698,2.0853-1.67352,2.93791-.47314,1.58923,.2998,3.25516,1.35931,5.26929l2.71771,5.05643-.00018-.00008-.00006,.00006Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M644.51258,157.14847l3.60046-6.36517,.62433-.22833c2.88788-1.0551,5.05707-2.55656,6.44995-4.46378,.2215-.30318,.42743-.61768,.63739-.93784,.83173-1.26933,1.8653-2.84744,3.94904-4.05124,1.16425-.66927,4.08008-2.05931,5.75934-.41121,.45605,.43826,.6712,.94907,.76514,1.43283,.09198-.03735,.18542-.07372,.28583-.11369,1.23505-.47079,1.97754-.51826,2.69275-.5639,.54968-.03542,1.11694-.07109,2.17609-.36165,.4646-.1273,.84845-.25673,1.17157-.3651,.97919-.32669,2.20227-.67622,3.315,.1505,1.15863,.92493,1.06903,2.37172,1.01038,3.32982-.104,1.70924-.37805,2.79738-.56012,3.51892-.06708,.26335-.1413,.56047-.14581,.6655-.02472,.84836,3.50293,2.59074,4.8269,3.25412,2.98059,1.4808,5.55969,2.76216,5.29425,5.12558-.18854,1.69139-1.841,2.91269-5.04828,3.72372-.99878,.25194-1.92053,.32565-2.70221,.3405,.23834,.5536,.33588,1.20889,.05194,1.92174h0c-.67438,1.68639-2.93585,2.22885-6.72412,1.61897-.94244-.14914-2.20807-.35446-3.67126-1.07094-.68878-.33809-1.25885-.71156-1.74109-1.03879-.20746,.26572-.48529,.51512-.8717,.69899-1.13556,.54279-2.45905,.23489-3.91455-.97415-1.61932-1.30589-2.77289-2.62991-3.79175-3.7959-.89069-1.01688-1.66022-1.88988-2.4173-2.36403-1.41724-.86081-3.22479-.53568-5.44177-.02168l-5.58044,1.34628-.00006-.00003,.00012-.00005Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M567.84552,275.79764l-.67438-1.66608,.73206-1.64035-.73206,1.64035-1.55786-.87595c.07391-.15009,.2179-.51373,.44757-1.07953,1.2608-3.09857,5.09436-12.53064,12.58569-26.33289,5.22968-9.63467,11.1344-19.15771,17.55237-28.30952,6.42822-9.16599,11.8252-15.72134,16.1618-20.99077,3.27155-3.974,6.45465-7.70885,9.55792-11.34554,8.28729-9.71805,16.1142-18.89854,23.3399-30.10365,1.61438-2.50061,4.97217-7.70731,5.90277-15.15956,.53931-4.32231,.18652-8.76157-1.05194-13.19197l3.46356-.96774c1.36432,4.89397,1.75189,9.80893,1.15344,14.60818-1.0318,8.2626-4.69049,13.936-6.44836,16.66193-7.35358,11.40279-15.2569,20.67097-23.62469,30.48233-3.09021,3.62447-6.26086,7.34229-9.51868,11.30026-4.29681,5.22034-9.64624,11.71904-15.99158,20.76746-6.34259,9.04169-12.17426,18.4487-17.33936,27.96121-7.39612,13.62866-11.17163,22.92075-12.41217,25.97333-.66345,1.62936-.80219,1.97076-1.54602,2.26852v-.00003Z"
                      fill="#f2f2f2"
                    />
                    <path
                      d="M641.4234,127.5048c-.11938-.0864-.23816-.17665-.35425-.27364-2.38245-1.92734-3.60443-5.0724-3.63428-9.34739-.01062-2.00875,.5816-3.86289,1.76263-7.56062,.18115-.57063,1.13275-3.44243,3.01007-6.98292,1.22589-2.31394,1.89844-3.16566,2.87653-3.64046,1.08734-.53003,2.27112-.59175,3.4068-.38943,.16467-.30536,.40222-.57093,.73499-.77633,1.37445-.85503,2.57843,.25863,3.23645,.85171,.32812,.30672,.7356,.69246,1.2403,1.01862,.7915,.51639,1.36694,.58617,2.23639,.69546,.83215,.10399,1.86694,.23328,3.1283,.80372,2.49347,1.1154,3.86444,3.04288,4.31683,3.67772,2.38965,3.32719,2.17084,6.89819,1.91681,11.03271-.05316,.82779-.32104,3.78716-1.56226,7.2118-.89539,2.47073-1.63605,3.32088-2.30188,3.86996-1.36407,1.13107-2.78583,1.31517-6.20502,1.51811-3.57404,.21648-5.36633,.32307-6.73822,.18375-3.19031-.32883-5.19366-.53523-7.07007-1.89285l-.00006,.00008h-.00006Z"
                      fill="#f2f2f2"
                    />
                  </g>
                  <path
                    d="M184.34799,567.02121c-23.12012,5.60791-47.27298,8.57294-72.11433,8.57294-26.90682,0-53.01412-3.47583-77.86659-10.02765-2.70956-10.02759-5.78561-21.13232-9.27245-33.41418-31.28216-110.28137,32.09272-188.47003,32.09272-188.47003l15.63552-12.33737,140.74174,18.92249c16.37952,79.85437,5.71898,139.10938-29.21663,216.75388l.00002-.00006Z"
                    fill="#2f2e41"
                  />
                  <polygon
                    points="161.42223 132.99535 95.58132 126.41126 47.84666 167.56182 62.66086 315.70386 56.07677 343.68625 212.44892 350.27033 204.2188 310.76578 215.74097 165.91581 161.42223 132.99535"
                    fill="#6c63ff"
                  />
                  <rect
                    x="77.47507"
                    y="210.35842"
                    width="105.34544"
                    height="164.60225"
                    fill="#fff"
                  />
                  <path
                    d="M167.78852,232.01325h-29.43517c-.79613,0-1.44383-.64772-1.44383-1.44383s.64772-1.44383,1.44383-1.44383h29.43517c.79613,0,1.44383,.64772,1.44383,1.44383s-.64772,1.44383-1.44383,1.44383Z"
                    fill="#6c63ff"
                  />
                  <path
                    d="M167.78852,243.11802h-29.43517c-.79613,0-1.44383-.64772-1.44383-1.44383s.64772-1.44383,1.44383-1.44383h29.43517c.79613,0,1.44383,.64772,1.44383,1.44383s-.64772,1.44383-1.44383,1.44383Z"
                    fill="#6c63ff"
                  />
                  <path
                    d="M167.78852,254.22278h-29.43517c-.79613,0-1.44383-.64771-1.44383-1.44382s.64772-1.44382,1.44383-1.44382h29.43517c.79613,0,1.44383,.64771,1.44383,1.44382s-.64772,1.44382-1.44383,1.44382Z"
                    fill="#6c63ff"
                  />
                  <path
                    d="M166.46749,293.08945H94.89091c-1.9359,0-3.51093-1.57504-3.51093-3.51093s1.57503-3.51093,3.51093-3.51093h71.57658c1.9359,0,3.51093,1.57504,3.51093,3.51093s-1.57503,3.51093-3.51093,3.51093Z"
                    fill="#e6e6e6"
                  />
                  <path
                    id="b-97"
                    d="M126.20111,357.02036c14.24146,4.46347,28.08838,.73328,30.92747-8.33054s-6.40411-20.02698-20.65126-24.49014c-5.66669-1.8609-11.69664-2.33771-17.58535-1.39047l-60.58049-18.14993-38.44721,27.50479,91.0975,15.96051c4.29645,4.13977,9.52204,7.19016,15.23933,8.89578Z"
                    fill="#ffb6b6"
                  />
                  <path
                    d="M54.05117,164.26978s-22.07198,12.61256-28.37826,39.41425L.44778,310.89081s-4.72971,15.76569,16.55399,23.64856c21.2837,7.88284,47.2971-26.0134,47.2971-26.0134l-11.88014-11.88013,22.91613-100.05634-21.2837-32.31969v-.00005Z"
                    fill="#6c63ff"
                  />
                  <path
                    id="c-98"
                    d="M109.7811,341.17499c-14.80532,1.88269-27.77766-4.23041-28.97426-13.6528-1.1966-9.42239,9.83472-18.58417,24.64556-20.46552,5.90602-.83267,11.92557-.23889,17.55503,1.73175l62.83147-7.18478,32.99562,33.85248-92.48442-.35074c-4.95902,3.31744-10.64056,5.39871-16.569,6.06961Z"
                    fill="#ffb6b6"
                  />
                  <path
                    d="M214.78427,164.16446s19.50253,16.30646,20.98466,43.80014l5.92856,109.97476s1.87601,16.35263-20.4641,20.3595-41.96983-33.94476-41.96983-33.94476l13.7886-9.59946-4.91643-102.52927,26.64851-28.06091h.00002Z"
                    fill="#6c63ff"
                  />
                  <rect
                    x="88.99723"
                    y="221.88057"
                    width="37.85852"
                    height="46.08864"
                    fill="#6c63ff"
                  />
                  <path
                    d="M99.10383,256.28238l-2.60074,11.39056-.0658,.29626h-7.4071c.88882-3.75299,1.99162-8.39478,2.50189-10.61688,.64197-2.69949,2.32095-4.44427,3.3908-5.31662,.54322-.47742,.93824-.69141,.93824-.69141l3.24272,4.93808h-.00002Z"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M124.10691,267.96921h-7.20959l-.59254-12.36166,3.95039-4.16449,.11523-.11514s2.9793,2.48541,3.19329,6.68286c.11523,2.09039,.3457,6.28772,.54321,9.95844Z"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M508.06806,292.59415c-65.6167,0-119-53.38281-119-119s53.3833-119,119-119,119,53.3833,119,119-53.3833,119-119,119Zm0-236c-64.51416,0-84,83-117,117-44.93219,46.29376,52.48584,117,117,117s117-52.48633,117-117-52.48584-117-117-117Z"
                    fill="#e6e6e6"
                  />
                  <path
                    d="M514.88428,199.99296c0,1.84239-1.49353,3.33594-3.33594,3.33594s-3.33594-1.49355-3.33594-3.33594v-25.30643l-7.64597,7.65263c-1.30441,1.30441-3.41928,1.30441-4.72369,0s-1.30441-3.41928,0-4.72369l13.34375-13.34375c1.30112-1.30441,3.4133-1.30708,4.71774-.00597l.00598,.00597,13.34375,13.34375c1.30438,1.30441,1.30438,3.41928,0,4.72369s-3.41925,1.30441-4.72369,0l-7.646-7.65263v25.30643Z"
                    fill="#6c63ff"
                  />
                  <path
                    d="M551.57959,216.67264v-63.38281l-30.02344-30.02344h-36.69531c-7.36954,0-13.34375,5.9742-13.34375,13.34375v80.0625c0,7.36955,5.97421,13.34375,13.34375,13.34375h53.375c7.36957,0,13.34375-5.9742,13.34375-13.34375Zm-30.02344-73.39062c0,5.52716,4.48065,10.00781,10.00781,10.00781h13.34375v63.38281c0,3.68478-2.98712,6.67188-6.67188,6.67188h-53.375c-3.68478,0-6.67188-2.98711-6.67188-6.67188v-80.0625c0-3.68477,2.98709-6.67188,6.67188-6.67188h36.69531v13.34375Z"
                    fill="#6c63ff"
                  />
                  <g>
                    <rect
                      x="102.55623"
                      y="237.41272"
                      width="12.96611"
                      height="12.29546"
                      transform="translate(-27.74113 14.42648) rotate(-6.71736)"
                      fill="#2f2e41"
                    />
                    <circle cx="108.17718" cy="237.41361" r="6.32199" fill="#ffb6b6" />
                    <path
                      d="M104.009,227.60815h.00001c-3.93968,1.09372-3.57277,2.5623-4.7665,3.48768-2.1031,1.63033-2.53243,5.67355-1.03083,8.13138,.4012,.6567,1.18625,1.52456,.97986,2.58578-.15845,.81464-.82723,1.36297-.95319,1.46285-1.03098,.81744-.40094-.08478-.83579,.54864-.47997,.69915,.48466,1.49327,.09177,2.69038-.34829,1.06128-1.32063,1.08968-1.37109,1.73718-.0869,1.11499,2.6416,3.01494,5.25051,2.53298,2.32289-.42911,3.82883-2.61303,4.19171-4.54547,.24306-1.29449,.15831-3.46188-.96703-4.38809-.15784-.1299-.58393-.43932-1.01882-1.0055-.34414-.44804-.79721-1.03784-.62709-1.50183,.18122-.49432,.87971-.32765,1.25366-.82296,.50716-.67172-.29999-1.61062-.31379-2.66423-.02333-1.78409,2.22413-4.19787,4.91007-4.17989,3.04701,.02038,4.53309,3.15607,4.68906,3.4995,.32328,.7118,.40285,1.4279,.56196,2.8601,.2284,2.05531,.37149,3.34353-.11692,4.74084-.70249,2.00976-1.90685,1.94342-2.07612,3.3959-.26386,2.26465,2.45866,4.1872,2.76933,4.40091,2.30326,1.58425,5.52128,1.76314,5.95555,.87425,.3913-.80101-1.848-1.71158-2.05096-4.03532-.17591-2.01372,1.37594-2.81668,.86142-4.15324-.56632-1.47126-2.59426-.88156-3.67022-2.494-1.0043-1.50505,.39437-2.57046-.23585-5.82479-.13334-.68842-.58617-2.65592-2.10327-4.47936-.66836-.80332-1.34811-1.62033-2.48169-1.95869-1.26902-.37879-4.81173-1.47356-6.89572-.89502l-.00002,.00002Z"
                      fill="#2f2e41"
                    />
                    <path
                      d="M101.99855,233.4724c.32481,1.35564,2.46866,1.78624,3.36976,1.85409,.38164,.02875,1.67133,.12586,2.8601-.56195,.43938-.25424,.58677-.45471,1.05779-.57479,.63771-.16255,.99315,.04542,2.05047,.20869,1.17572,.18156,1.76362,.27235,2.02432-.01333,.42619-.46698-.0968-1.76886-.75783-2.61193-1.22227-1.55888-3.15879-1.85809-4.06197-1.99767-1.03189-.15945-3.1259-.48304-4.85826,.79731-.23162,.17118-2.01438,1.52223-1.68438,2.89957h.00001Z"
                      fill="#2f2e41"
                    />
                  </g>
                  <polygon
                    points="120.5186 251.60773 119.21818 267.96921 96.51956 267.96921 96.50309 267.67292 94.92287 252.03571 94.90649 251.85456 99.71286 247.72313 101.19421 246.4392 102.19836 245.58323 104.78263 245.84665 112.22258 246.58738 112.23906 246.58738 114.74105 248.1017 118.47745 250.3732 120.25518 251.44306 120.5186 251.60773"
                    fill="#e6e6e6"
                  />
                </svg>
              </div>
              <div className="w-full sm:w-1/2 p-6 mt-6">
                <div className="align-middle">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Recruiting Agencies
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Recruiting agencies always find it difficult to manage and deliver the sourced
                    candidates to partner companies.{" "}
                    <span className="font-bold">
                      We help you source as well as deliver the candidates!
                    </span>
                    <br />
                    <br />- hire.win allows you to{" "}
                    <span className="font-bold">create multiple companies</span> and invite the
                    hiring team of the respective company. This way,{" "}
                    <span className="font-bold">
                      you will be continuously delivering the candidates to the company as and when
                      they are sourced
                    </span>
                    . Let the company carry out the rest of the hiring process all from the
                    dashboard while you source candidates!
                    <br />
                    <br />- Your partner companies will keep coming back to you for their hiring
                    needs when you have an{" "}
                    <span className="font-bold">inclusive system for delivering candidates!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-to-use" className="bg-white border-b px-4 py-12 mt-12">
          <div className="container mx-auto flex flex-wrap">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-neutral-800">
              Getting started is easy!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-96 opacity-25 my-0 py-0 rounded-t"></div>
            </div>
          </div>

          <div className="my-4">
            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/2 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-pink-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      1. Sign Up
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      Signing up {"won't"} take a minute. Your{" "}
                      <span className="font-bold">careers page will be live</span> as soon as you
                      sign up. You can later customise the theme to match branding and add company
                      details and logo.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-pink-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      2. Create a Job & invite your team
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      Creating a job by{" "}
                      <span className="font-bold">just entering the title is enough</span> to start
                      receiving applicants! We do all the basic job setup for you. You can then
                      start adding more details and fully customise it as per your needs.{" "}
                      <span className="font-bold">Invite your team to collaborate</span> once your
                      job is setup.
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/2 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-pink-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      3. Share with the world
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      Share your job post link or your careers page link on multiple platforms and
                      <span className="font-bold">start receiving applicants</span> in your
                      dashboard. You can also manually add candidates when you source from other
                      channels.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-pink-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      4. Interview and Track candidates
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      Let your team{" "}
                      <span className="font-bold">
                        schedule interviews and track candidates across hiring stages
                      </span>
                      . Scheduling interview is a one click process. Invitation mails are sent
                      automatically and the meeting appears in your connected calendar.
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="4-essentials" className="bg-gray-100 border-b px-4 py-8 mt-12">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              The 4 Essentials
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">Scores</h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - You can <span className="font-bold">pre-configure score cards</span> for all
                    the stages from the job settings page.
                    <br />
                    <br />- The configured score card then appears for the current stage so that the{" "}
                    <span className="font-bold">interviewer can provide a score</span>. A note can
                    also be added along with score rating.
                    <br />
                    <br />- The interviewer can also{" "}
                    <span className="font-bold">refer to previous stage scores</span> before adding
                    a score for the current stage.
                  </p>
                </div>
                <div className="w-full sm:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/scores.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/scores.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/scores.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/scores.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interviews.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interviews.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interviews.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interviews.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Interviews
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - Scheduling interviews is a{" "}
                      <span className="font-bold">one-click process</span> with hire.win!
                      <br />
                      <br />- You already know the availability of the interviewer and the free
                      slots are shown to select from. Just{" "}
                      <span className="font-bold">select a slot and click schedule</span>.
                      <br />
                      <br />- The{" "}
                      <span className="font-bold">
                        meeting link will be auto-generated and invitation mails will be sent
                      </span>{" "}
                      to all the participants including the candidate & interivewer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">Comments</h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Comments can be added for each of the stages{" "}
                    <span className="font-bold">by the hiring team</span>.
                    <br />
                    <br />- You can use it for{" "}
                    <span className="font-bold">
                      internal communication regarding the candidate
                    </span>{" "}
                    with your team.
                    <br />
                    <br />- You may also add comments{" "}
                    <span className="font-bold">
                      before rejecting a candidate or moving to next stage
                    </span>
                    .
                  </p>
                </div>
                <div className="w-full sm:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/comments.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/comments.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/comments.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgScoresCommentsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/comments.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/emails.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/emails.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/emails.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgInterviewsEmailsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/emails.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/2 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">Emails</h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can <span className="font-bold">send an email to the candidate</span>{" "}
                      from the emails section.
                      <br />
                      <br />- You can also{" "}
                      <span className="font-bold">
                        select from pre-configured email templates
                      </span>{" "}
                      to send an email with one-click.
                      <br />
                      <br />- All the{" "}
                      <span className="font-bold">
                        sent emails are listed under the Emails section
                      </span>
                      . You can navigate through previous stages to check{" "}
                      <span className="font-bold">candidate email history</span> in each stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="candidate-essentials" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Candidate Specific Tools
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    File Uploads
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Candidate files are very important during the interview process and we made
                    sure <span className="font-bold">they are just a click away</span>!
                    <br />
                    <br />- You can <span className="font-bold">upload unlimited files</span> for a
                    candidate. All the file types are supported.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileFileUploadHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/file-upload.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smFileUploadHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/file-upload.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdFileUploadHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/file-upload.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgFileUploadHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/file-upload.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileCandidateActivityHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-activity.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smCandidateActivityHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-activity.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdCandidateActivityHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-activity.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgCandidateActivityHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-activity.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">Timeline</h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can view{" "}
                      <span className="font-bold">
                        all the activities that happened specific to a candidate
                      </span>{" "}
                      along with the exact timestamp.
                      <br />
                      <br />- Often, the interview lasts longer than usual, at that time,{" "}
                      <span className="font-bold">
                        the timeline comes in handy for past activity review
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Private Notes
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - As opposed to comments, private notes are{" "}
                    <span className="font-bold">
                      only for your reference and are not shared with your team
                    </span>
                    .
                    <br />
                    <br />- You can use it to write notes during interview or anything else
                    regarding the candidate that you need only{" "}
                    <span className="font-bold">for your personal reference</span>.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobilePrivateNotesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/private-notes.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smPrivateNotesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/private-notes.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdPrivateNotesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/private-notes.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgPrivateNotesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/private-notes.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="board-table" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Board View & Table View
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <p className="my-6 text-center text-neutral-600">
              <span className="font-bold">Board view</span> gives you a{" "}
              <span className="font-bold">quick overview of candidates in each stage</span> and lets
              you drag & drop across stages, whereas the{" "}
              <span className="font-bold">table view</span> shows you all the{" "}
              <span className="font-bold">
                candidates{"'"} information and application responses at a glance
              </span>
              .
            </p>

            <div className="w-full pt-3">
              <div className="w-full block sm:hidden md:hidden lg:hidden mobileBoardHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/board.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:block md:hidden lg:hidden smBoardHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/board.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:hidden md:block lg:hidden mdBoardHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/board.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:hidden md:hidden lg:block lgBoardHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/board.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>

            <div className="w-full pt-3">
              <div className="w-full block sm:hidden md:hidden lg:hidden mobileTableHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/table.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:block md:hidden lg:hidden smTableHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/table.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:hidden md:block lg:hidden mdTableHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/table.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="w-full hidden sm:hidden md:hidden lg:block lgTableHeight relative">
                <Image
                  priority={true}
                  alt="job"
                  src="/landing-screenshots/table.webp"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="members" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Team Collaboration
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Hiring Team
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Make hiring a team effort.{" "}
                    <span className="font-bold">
                      Invite your entire hiring team and assign roles
                    </span>{" "}
                    so that you can collaborate with your team to close your hires quickly.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileMembersHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/members.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smMembersHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/members.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdMembersHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/members.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgMembersHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/members.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileMemberAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/member-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smMemberAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/member-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdMemberAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/member-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgMemberAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/member-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Interview Duration & Interviewer Assignment
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can{" "}
                      <span className="font-bold">select interview duration for job stages</span> so
                      that the interview scheduling slots appear accordingly while scheduling an
                      interview for that particular stage.
                      <br />
                      <br />- You can{" "}
                      <span className="font-bold">
                        assign interviewers for each of the job stages
                      </span>
                      . Only the assigned interviewer shall be able to provide a score for that
                      particular stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="schedules-calendars" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Schedules & Calendars
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">Schedules</h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Schedules give you the <span className="font-bold">control of your time</span>
                    !
                    <br />
                    <br />- It lets you{" "}
                    <span className="font-bold">set your availability to take interviews</span>. You
                    can set the duration for each day in a week when you would be available to
                    conduct an interview.
                    <br />
                    <br />- You can{" "}
                    <span className="font-bold">pre-configure multiple schedules</span> and then
                    assign to job stages.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileSchedulesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedules.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smSchedulesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedules.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdSchedulesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedules.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgSchedulesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedules.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileCalendarsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/calendars.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smCalendarsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/calendars.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdCalendarsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/calendars.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgCalendarsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/calendars.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Calendars
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can <span className="font-bold">add your work calendars</span> so that
                      you can be booked for conducting interviews.
                      <br />
                      <br />-{" "}
                      <span className="font-bold">
                        Your availability is checked across all your connected calendars
                      </span>{" "}
                      while you are being booked for an interview. This makes sure{" "}
                      <span className="font-bold">you never have overlapping meetings</span>.
                      <br />
                      <br />- Similar to schedules,{" "}
                      <span className="font-bold">you can assign a calendar to a job stage</span> so
                      that your meetings for that particular stage get booked in the assigned
                      calendar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Schedule Calendar Assignment
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - You can assign pre-configured schedules to job stages. This way, when you are
                    being booked for an interview for that particular stage,{" "}
                    <span className="font-bold">
                      only the slots as per your assigned schedule shall appear
                    </span>
                    .
                    <br />
                    <br />- Similarly, you can assign your work calendars to job stages. This way,{" "}
                    <span className="font-bold">
                      you may book screening calls in one calendar and offer calls in another
                      calendar
                    </span>
                    .
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileScheduleCalAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedule-calendar-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smScheduleCalAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedule-calendar-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdScheduleCalAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedule-calendar-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgScheduleCalAssignHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/schedule-calendar-assignment.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileInterviewSchedulingHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interview-scheduling.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smInterviewSchedulingHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interview-scheduling.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdInterviewSchedulingHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interview-scheduling.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgInterviewSchedulingHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/interview-scheduling.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Interview Scheduling
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - Our interview scheduling feature allows you to{" "}
                      <span className="font-bold">book interviews in just one click</span>!
                      <br />
                      <br />- It{" "}
                      <span className="font-bold">
                        frees the organiser from the to-and-fro chat hustle
                      </span>{" "}
                      to find a free slot in order to conduct interviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="template-pools-categories" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Providing you a helping hand!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Email Templates
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - Email templates make your life way simpler as you can literally{" "}
                    <span className="font-bold">send emails to candidates in a single click</span>!
                    <br />
                    <br />- <span className="font-bold">Pre-configure the templates</span> that you
                    send most often so that you {"don't"} have to type a single word, not even the
                    candidate email. Just click the Send button and {"that's"} it!
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileEmailTemplateHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/email-templates.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smEmailTemplateHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/email-templates.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdEmailTemplateHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/email-templates.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgEmailTemplateHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/email-templates.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileCandidatePoolsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-pools.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smCandidatePoolsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-pools.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdCandidatePoolsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-pools.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgCandidatePoolsHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/candidate-pools.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Candidate Pools
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      -{" "}
                      <span className="font-bold">
                        Not all candidates are rejected because of their inability!
                      </span>{" "}
                      There are reasons like salary expectation mismatch, notice period issues, etc.
                      <br />
                      <br />-{" "}
                      <span className="font-bold">
                        {"Don't"} let such candidates just get lost over time
                      </span>
                      . Instead you can create candidate pools and add candidates to them.
                      <br />
                      <br />- Consider candidate pools as{" "}
                      <span className="font-bold">
                        folders of candidates where you file them for future reference
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Job Categories
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - You can{" "}
                    <span className="font-bold">add job categories and assign to jobs</span>
                    .
                    <br />
                    <br />- Job Categories help you{" "}
                    <span className="font-bold">filter through jobs by department</span>.
                    <br />
                    <br />- Job category filters are{" "}
                    <span className="font-bold">also available on careers page</span> for the
                    candidates to filter through jobs by department.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileJobCategoriesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/job-categories.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smJobCategoriesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/job-categories.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdJobCategoriesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/job-categories.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgJobCategoriesHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/job-categories.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="jobs-careers-page" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Jobs & Careers Page
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Jobs Overview
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - All the jobs that you create are available to view on the{" "}
                    <span className="font-bold">jobs overview page</span>.
                    <br />
                    <br />- Each job shows the{" "}
                    <span className="font-bold">count of candidates in different stages</span> so
                    that you can easily check the hiring progress for each of the jobs{" "}
                    <span className="font-bold">at a glance</span>.
                    <br />
                    <br />- Further, you can{" "}
                    <span className="font-bold">filter the jobs by category</span> to view hiring
                    progress for a specific department.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileJobsOverviewHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/jobs-overview.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smJobsOverviewHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/jobs-overview.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdJobsOverviewHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/jobs-overview.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgJobsOverviewHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/jobs-overview.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-1/2">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileCareersPageHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/company-settings.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smCareersPageHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/company-settings.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdCareersPageHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/company-settings.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgCareersPageHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/company-settings.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Careers Page Customisation
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can <span className="font-bold">customise the careers page</span> as per
                      your needs using the company settigs page.
                      <br />
                      <br />- You can{" "}
                      <span className="font-bold">customise the theme of your careers page</span>,
                      as well as provide additional info about your company.
                      <br />
                      <br />- The careers page shall{" "}
                      <span className="font-bold">automatically update</span> with all the
                      information that you provide.
                      <br />
                      <br />-{" "}
                      <span className="font-bold">
                        A logo shall appear as the header if you provide one
                      </span>{" "}
                      or else the company name shall be used as the careers page title.
                      <br />
                      <br />
                      <button>
                        <a
                          href="https://hire.win/padason"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex flex-nowrap items-center justify-center space-x-2"
                        >
                          <span>View Live Demo</span>
                          <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="job-configuration" className="bg-gray-100 border-b px-4 py-8">
          <div className="container max-w-5xl mx-auto mt-8">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-gray-800">
              Job Configuration
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-80 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="flex flex-col space-y-16 mt-16">
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Application Form Config
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - You can design job application form{" "}
                    <span className="font-bold">similar to a google form</span> so that the
                    candidates can apply to a job.
                    <br />
                    <br />- You can <span className="font-bold">
                      configure the question type
                    </span>{" "}
                    as per your need.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileFormConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/application-form-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smFormConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/application-form-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdFormConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/application-form-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgFormConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/application-form-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap flex-col-reverse md:flex-row">
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileStagesConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/stages-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smStagesConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/stages-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdStagesConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/stages-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgStagesConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/stages-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/3 px-6">
                  <div className="align-middle">
                    <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                      Stages Config
                    </h3>
                    <p className="text-gray-600 mb-8 text-justify">
                      - You can <span className="font-bold">add and arrange hiring stages</span> for
                      a job so that you can track candidates across them.
                      <br />
                      <br />- We provide a{" "}
                      <span className="font-bold">minimal hiring stage configuration</span> by
                      default which you may alter as per your needs. Though, you cannot rename or
                      remove the Sourced and Hired stages.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full md:w-1/3 px-6">
                  <h3 className="text-3xl text-gray-800 font-bold leading-none mb-3">
                    Score Card Config
                  </h3>
                  <p className="text-gray-600 mb-8 text-justify">
                    - You can configure score cards{" "}
                    <span className="font-bold">for each of the job stages</span>.
                    <br />
                    <br />- Score cards are an{" "}
                    <span className="font-bold">integral part of interview feedback</span> and acts
                    as a reference for interview questions.
                    <br />
                    <br />- Only{" "}
                    <span className="font-bold">
                      the interviewer for a particular stage can submit a score
                    </span>{" "}
                    using the score card. Other members can view the score.
                  </p>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="w-full block sm:hidden md:hidden lg:hidden mobileScoreCardConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/score-card-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:block md:hidden lg:hidden smScoreCardConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/score-card-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:block lg:hidden mdScoreCardConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/score-card-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="w-full hidden sm:hidden md:hidden lg:block lgScoreCardConfigHeight relative">
                    <Image
                      priority={true}
                      alt="job"
                      src="/landing-screenshots/score-card-config.webp"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section id="features" className="bg-gray-100 border-b px-4 py-12">
          <div className="container mx-auto flex flex-wrap">
            <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-neutral-800">
              Too much, but just what actually matters!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-96 opacity-25 my-0 py-0 rounded-t"></div>
            </div>
          </div>

          <div className="my-4">
            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      Careers page
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      A careers page is a must as it helps source candidates.{" "}
                      <span className="font-bold">
                        No more sharing your hr email, instead share your careers page or an
                        individual job post.
                      </span>
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      Applicant Tracking
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      Tracking applicants is as simple as dragging a candidate from a particular
                      hiring stage to another.{" "}
                      <span className="font-bold">
                        The interviewer for respective stages are auto-assigned.
                      </span>
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 mt-6">
                      Interview Scheduling
                    </div>
                    <p className="text-neutral-600 text-base px-6 my-5">
                      When the assigned interviewer has their calendar connected and availability
                      set, you can{" "}
                      <span className="font-bold">
                        view the free time slots and choose one to auto-generate a meeting.
                      </span>
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Multiple Candidate Views
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You have a <span className="font-bold">Board view</span>, a{" "}
                      <span className="font-bold">Table view</span> and a{" "}
                      <span className="font-bold">Candidate View</span>. Switch between views as per
                      the task you are performing. Candidate view is truly an inclusive view.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Job Application Form
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can fully customise an Application Form through which the candidates apply
                      to job post.{" "}
                      <span className="font-bold">
                        Very similar to Google Forms which you are already familiar with.
                      </span>
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Hiring Stages
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      Every job has different hiring stages, some may have an HR round, some may
                      not. You can{" "}
                      <span className="font-bold">
                        fully customise the stages to track the candidates through them.
                      </span>
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Candidate Pools
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      Many candidates are{" "}
                      <span className="font-bold">
                        rejected because of reasons like salary expectation mismatch
                      </span>
                      . Candidate pools help you{" "}
                      <span className="font-bold">
                        build a database of candidates to close urgent hires.
                      </span>
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Unlimited File Uploads
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can{" "}
                      <span className="font-bold">
                        upload as many files related to a candidate as you want
                      </span>
                      , be it for background verification or project portfolio.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Job posting to Google Jobs
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      We post your job to Google Jobs which{" "}
                      <span className="font-bold">
                        increases the reach of your job post and attract more candidates
                      </span>
                      . This also improves SEO of your careers page.
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Google & Outlook Calendar integration
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      Your team members can integrate their organisation calendars so that{" "}
                      <span className="font-bold">
                        they can be booked for interviews and they never have overlapping meetings
                        scheduled.
                      </span>
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Candidate Timeline
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      <span className="font-bold">
                        Timeline comes in handy when you need to look back what events happened at
                        what point in time.
                      </span>{" "}
                      It includes all the events like emails sent, interview scheduled, etc.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Private Notes
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      <span className="font-bold">
                        You may need to take notes about the candidate, say for example when you are
                        going through a screening call.
                      </span>{" "}
                      The notes are private to you and other users {"won't"} see your notes.
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Emails
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can send an{" "}
                      <span className="font-bold">
                        email to the candidate by just providing a subject and formated text
                      </span>
                      . <span className="font-bold">You can also select an email template</span> and
                      send it with a single click.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Comments
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      Comments for a candidate can be added and replied to by multiple users. You
                      may treat it as an{" "}
                      <span className="font-bold">
                        internal communication for a specific candidate
                      </span>
                      .
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Score Cards
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You may{" "}
                      <span className="font-bold">
                        pre-configure score card questions for job stages
                      </span>
                      . The interviewer for that particular stage will then be able to{" "}
                      <span className="font-bold">
                        rate the candidates and add notes for those questions
                      </span>
                      .
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Schedules Configuration
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can pre-configure your availability schedules of the{" "}
                      <span className="font-bold">days in the week and hours in the day</span>{" "}
                      during which you are available to take interviews.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Interviewer Assignment
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can assign <span className="font-bold">interviewers for stages</span> as
                      you invite your team to a Job. You can also{" "}
                      <span className="font-bold">
                        override the stage interviewer for a specific candidate stage
                      </span>
                      .
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Stage specific data
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      All the{" "}
                      <span className="font-bold">
                        candidate communication, scores & interviews remain specific to hiring
                        stages
                      </span>{" "}
                      so that they can be referred to later by next {"stage's"} interviewer.
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Job Categories
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can{" "}
                      <span className="font-bold">
                        categorise your jobs for different departments
                      </span>{" "}
                      like Engineering, Marketing, Support, etc. This{" "}
                      <span className="font-bold">helps filter and find relevant jobs easily</span>.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Unlimited Users with Company & Job roles
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      <span className="font-bold">
                        You can invite as many team members as you want. Users can have different
                        roles for a company and a job.
                      </span>{" "}
                      A company admin can be a job user. This allows{" "}
                      <span className="font-bold">greater level of access control</span>.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Stage-wise Calendar & Schedule assignment
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can map different calendars and schedules to different stages. This is{" "}
                      <span className="font-bold">
                        useful when you handle multiple stages like screening and hr round
                      </span>
                      .
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-wrap">
              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Multiple Companies
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      You can add more than one company and switch between them. All the jobs & data
                      are company specific. It is{" "}
                      <span className="font-bold">
                        very useful for group of companies & recruiting agencies
                      </span>
                      .
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Jobs Overview with Category filters
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      The jobs overview page shows the{" "}
                      <span className="font-bold">
                        count of candidates in different stages of jobs at a glance
                      </span>
                      . You can also filter jobs by categories to{" "}
                      <span className="font-bold">view progress for a specific department</span>.
                    </p>
                  </a>
                </div>
              </div>

              <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                <div className="flex-1 bg-yellow-50 rounded-t rounded-b-none overflow-hidden shadow">
                  <a className="flex flex-wrap no-underline hover:no-underline">
                    <div className="w-full font-bold text-xl text-neutral-800 px-6 my-6">
                      Email Templates
                    </div>
                    <p className="text-neutral-600 text-base px-6 mb-5">
                      <span className="font-bold">
                        You {"don't"} have to type the same emails for different candidates
                      </span>
                      . Create pre-configured email templates so that{" "}
                      <span className="font-bold">you can send emails with just one click</span>!
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* <section id="screenshots" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="pb-4 lg:pb-8 space-y-2">
            <h1 className="text-center font-bold text-3xl lg:text-5xl">
              Pictures speak louder than words!
            </h1>
            <h2 className="text-center">
              (Horizontal Scroll on Images - Use scroll wheel while holding the shift key if using
              mouse)
            </h2>
          </div>

          <div className="mt-4">
            <iframe
              // style="border: none;"
              className="border-0 w-full h-screen"
              src="https://cards.producthunt.com/cards/posts/356023?v=1"
              // width="500"
              // height="405"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
            ></iframe>
          </div>
        </section> */}
        {/* <section id="screenshots" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="pb-4 lg:pb-8 space-y-2">
            <h1 className="text-center font-bold text-3xl lg:text-5xl">
              Pictures speak louder than words!
            </h1>
          </div>
          <div className="text-indigo-600 font-bold text-2xl lg:text-4xl text-center">
            <button
              className="hover:underline"
              onClick={() => {
                if (imageIndex === 0) {
                  setImageIndex(imageArray.length - 1)
                } else {
                  setImageIndex(imageIndex - 1)
                }
              }}
            >
              Prev
            </button>{" "}
            |{" "}
            <button
              className="hover:underline"
              onClick={() => {
                if (imageIndex === imageArray.length - 1) {
                  setImageIndex(0)
                } else {
                  setImageIndex(imageIndex + 1)
                }
              }}
            >
              Next
            </button>
          </div>
          <div className="flex flex-col space-y-12 mt-3 border-2 border-indigo-500 p-2">
            <div className="w-full h-screen relative">
              {imageArray.map((image, index) => {
                return (
                  <span hidden={index !== imageIndex} key={image.key}>
                    {image}
                  </span>
                )
              })}
            </div>
          </div>
        </section> */}

        {/* <section id="pricing" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Pricing?
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-48 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <span className="text-2xl lg:text-3xl">
                <span className="bg-yellow-300">No nonsense</span> per user per job pricing, instead
                we offer Flat Pricing!
              </span>
            </div>

            <div className="flex flex-col md:flex-row lg:flex-row justify-center my-12 md:space-x-8 lg:space-x-8 space-y-8 md:space-y-0 lg:space-y-0">
              <div className="text-black flex flex-col w-full md:w-5/6 lg:w-1/3 mx-auto lg:mx-0 rounded-lg bg-white bg-gradient-to-br md:bg-gradient-to-bl lg:bg-gradient-to-bl from-pink-100 via-violet-100 to-indigo-200 shadow hover:shadow-lg">
                <div className="flex-1 rounded-t rounded-b-none overflow-hidden">
                  <div className="w-full p-8 text-center">
                    <span className="text-3xl font-bold">Free</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">Essential features</span>
                    </div>
                  </div>
                  <ul className="w-full text-center text-xl px-8">
                    <li className="py-2 font-bold">1 Job</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">25 Candidates</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">1 User</li>
                    <li className="text-sm">(You yourself)</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">Essential app features</li>
                    <li className="text-sm">{`(Doesn't include auto job posting to Google Jobs)`}</li>
                  </ul>
                </div>
                <div className="flex-none mt-auto rounded-b rounded-t-none overflow-hidden p-6">
                  <div className="w-full py-6 text-4xl font-bold text-center">
                    {getCurrencySymbol(selectedCurrency) || "$"}0.00
                  </div>
                </div>
              </div>
              <div className="text-black flex flex-col w-full md:w-5/6 lg:w-1/3 mx-auto lg:mx-0 rounded-lg bg-white bg-gradient-to-br from-red-100 via-purple-100 to-indigo-300 shadow hover:shadow-lg">
                <div className="flex-1 rounded-t rounded-b-none overflow-hidden">
                  <div className="w-full p-8 text-center">
                    <span className="text-3xl font-bold">Pro</span>
                    <br />
                    <div className="mt-2">
                      <span className="text-lg">All the app features</span>
                    </div>
                  </div>
                  <ul className="w-full text-center text-xl px-8">
                    <li className="py-2 font-bold">Unlimited Jobs</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">Unlimited Candidates</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">Unlimited Users</li>
                    <li className="text-sm">(Admins, Interviewers)</li>
                    <li className="py-2">+</li>
                    <li className="py-2 font-bold">All app features</li>
                    <li className="text-sm">
                      <span className="bg-yellow-200">
                        (Includes auto job posting to <span className="font-bold">Google Jobs</span>
                        )
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex-none mt-auto rounded-b rounded-t-none overflow-hidden p-6">                  
                  <Suspense
                    fallback={
                      <div className="w-full py-6">
                        <div className="w-full text-4xl font-bold text-center whitespace-nowrap">
                          <span className="text-base">Flat</span> ...
                          <span className="text-base"> /month</span>
                        </div>
                        <div className="w-full text-base text-center">if paid ...</div>
                      </div>
                    }
                  >
                    <Plans
                      selectedCurrency={selectedCurrency}
                      selectedFrequency={selectedFrequency}
                    />
                  </Suspense>
                  <div className="flex flex-col space-y-3 items-center">
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name="currency"
                        paddingX={3}
                        paddingY={1}
                        value={selectedFrequency}
                        options={Object.keys(PlanFrequency).map((frequency) => {
                          return { label: frequency, value: frequency }
                        })}
                        onChange={async (value) => {
                          setSelectedFrequency(value)
                        }}
                      />
                    </Form>
                    <Form noFormatting={true} onSubmit={async (values) => {}}>
                      <LabeledToggleGroupField
                        name="currency"
                        paddingX={3}
                        paddingY={1}
                        value={selectedCurrency}
                        options={Object.keys(Currency).map((currency) => {
                          return { label: currency, value: currency }
                        })}
                        onChange={async (value) => {
                          setSelectedCurrency(value)
                        }}
                      />
                    </Form>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row items-center justify-center text-center">
              <div className="flex flex-col space-y-2 w-full md:w-2/3 lg:w-2/3 text-lg md:text-2xl lg:text-xl font-medium">
                <span>Create jobs, invite admins & interviewers, keep a track of candidates,</span>
                <span>Conduct interviews & gather feedback,</span>
                <span>
                  All with <span className="bg-yellow-300">flat pricing!</span>
                </span>
              </div>
            </div>

            <div className="mt-8 px-6 text-center">
              You may review our{" "}
              <Link href={Routes.Refunds()}>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  cancellation and refund policy
                </a>
              </Link>
            </div>
          </div>
        </section> */}

        {/* <section id="reviews" className="bg-gray-100 py-8 mt-16">
          <div className="container mx-auto px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              <span>{`Don't believe us, believe them!`}</span>
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-48 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl font-bold">
                  <span className="bg-yellow-300 underline hover:bg-fuchsia-300">
                    <a target="_blank" rel="noreferrer" href="https://twitter.com/hire_win">
                      Tweets
                    </a>
                  </span>{" "}
                  from our customers
                </span>
              </div>

              <div className="mt-10">
                <span className="text-lg font-semibold">
                  {`We're just getting started, no reviews yet ☹️`}
                </span>
                <br />
                <span className="text-lg font-semibold">
                  You may be the{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://twitter.com/hire_win"
                    className="underline hover:bg-fuchsia-300"
                  >
                    first one
                  </a>
                  !
                </span>
              </div>
            </div>
          </div>
        </section> */}

        {/* <section id="support" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Friendly folks standing by!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto bg-gradient-to-r from-neutral-200 to-neutral-500 w-48 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl px-2">
                  Write us to <span className="bg-yellow-300">support@hire.win</span> for any
                  queries
                </span>
              </div>
              <div className="mt-10 px-6 md:px-10 text-center">
                Visit our{" "}
                <Link href={Routes.Support()}>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    support page
                  </a>
                </Link>{" "}
                for more details
              </div>
            </div>
          </div>
        </section> */}

        <section id="sign-up" className="bg-white py-8 px-4 mt-12">
          <div className="text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              It only takes 5 minutes!
            </h2>

            <div className="w-full text-center pt-4">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl">
                  Empower your company with the <span className="bg-yellow-300">power of ATS</span>{" "}
                  now and streamline your hiring process.
                  {/* Decrease your time-to-hire per candidate by at least 3x. */}
                </span>
              </div>
              <div className="mt-6">
                <Link prefetch={true} href={Routes.SignupPage()}>
                  <a>
                    {/* <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 text-white hover:shadow-indigo-500 shadow-lg rounded my-2 md:my-6 py-3 lg:py-4 px-8 w-fit">
                      <span className="font-extrabold text-xl">Start 14 days free trial</span>
                      <br />
                      <span className="font-light hidden md:block lg:block">
                        no credit card required, cancel any time
                      </span>
                      <span className="font-light md:hidden lg:hidden">
                        no credit card required
                      </span>
                    </button> */}
                    <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 text-white font-extrabold text-xl hover:underline shadow-lg rounded my-4 py-3 lg:py-4 px-8 w-fit">
                      Get Early Access
                    </button>
                  </a>
                </Link>
              </div>
              <div className="mb-4">OR</div>
              <Suspense fallback="Loading...">
                <BookADemoButton />
              </Suspense>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
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
