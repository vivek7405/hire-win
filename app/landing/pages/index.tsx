import {
  GetServerSidePropsContext,
  GetStaticPropsContext,
  Head,
  Image,
  invalidateQuery,
  Link,
  Routes,
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
            className="w-full py-6"
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

export default function Home() {
  const screenshotsBucketURL = "https://s3.us-east-2.amazonaws.com/hire.win/landing-screenshots"

  const localeCurrency = LocaleCurrency.getCurrency(navigator.language || "en-US") || Currency.USD
  const [selectedCurrency, setSelectedCurrency] = useState(Currency[localeCurrency] || Currency.USD)

  const [imageIndex, setImageIndex] = useState(0)
  const imageArray = [
    <Image
      priority={true}
      layout="fill"
      objectFit="contain"
      key="jobs"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Jobs.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="kanban board"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Kanban-Board.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="candidates table"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Candidates-Table.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="job edit"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Job-Edit.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="job members"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Job-Members.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="candidate detail"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Candidate-Detail.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="form"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Form.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="workflows"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Workflows.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="workflow"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Workflow.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="score card"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Score-Card.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="interview scheduling"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Interview-Scheduling.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="company settings"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Company-Settings.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="schedules"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Schedules.webp`}
    />,
    <Image
      layout="fill"
      objectFit="contain"
      key="calendars"
      alt="Dashboard Job Listing"
      src={`${screenshotsBucketURL}/Calendars.webp`}
    />,
  ]

  const [selectedFrequency, setSelectedFrequency] = useState(PlanFrequency.YEARLY)

  return (
    <LandingLayout>
      <div className="h-full mt-3">
        <div className="text-center">
          <h1 className="my-4 text-3xl lg:text-5xl font-black leading-tight">
            Interviewing Kit with Careers Page
          </h1>
          <p className="leading-normal text-neutral-800 text-xl lg:text-3xl mb-8">
            Applicant Tracking, Collaborating, Interviewing & more!
          </p>

          <h1 className="my-4 text-2xl lg:text-4xl font-black leading-tight">
            <Link href={Routes.Beta()}>
              <a className="hover:underline">30% off for 3 months - BETA30</a>
            </Link>
          </h1>

          <div className="flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-3 md:space-y-0 lg:space-y-0 md:space-x-3 lg:space-x-3">
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
                className="w-48 md:w-56 lg:w-64"
                // style="width: 250px; height: 54px;"
                // width="250"
                // height="54"
              />
            </a>
            <Link prefetch={true} href={Routes.SignupPage()}>
              <a>
                <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 hover:underline text-white font-extrabold rounded py-3 lg:py-4 px-8 shadow-lg w-48">
                  Sign Up
                </button>
              </a>
            </Link>
            {/* <Link prefetch={true} href={Routes.LoginPage()}>
            <a className="inline-block mx-auto lg:mx-0 hover:underline bg-transparent text-neutral-600 font-extrabold py-2 lg:py-4 px-8">
              Login
            </a>
          </Link> */}
          </div>
        </div>

        <h1 className="text-center pt-8 pb-4 font-bold text-xl lg:text-2xl">
          Careers Page with <span className="bg-yellow-300">customizable theme color</span>:
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

        <section id="screenshots" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="pb-4 lg:pb-8 space-y-2">
            <h1 className="text-center font-bold text-3xl lg:text-5xl">
              Pictures speak louder than words!
            </h1>
            <h2 className="text-center text-xs">
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

          {/* <div className="text-indigo-600 font-bold text-2xl lg:text-4xl text-center">
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
          </div> */}
        </section>

        <section id="pricing" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Pricing?
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <h1 className="my-4 text-2xl lg:text-4xl font-black leading-tight">
                <Link href={Routes.Beta()}>
                  <a className="hover:underline">30% off for 3 months - BETA30</a>
                </Link>
              </h1>

              <div className="mt-10">
                <span className="text-2xl lg:text-3xl font-bold">
                  <span className="bg-yellow-300">No nonsense</span> per user per job pricing,
                  instead we offer Flat Pricing!
                </span>
              </div>
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
                  {/* <div className="w-full py-6 text-4xl font-bold text-center">
                    <span className="text-base">Flat</span> $29.99{" "}
                    <span className="text-base">/month</span>
                  </div> */}
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
                {/* <div className="flex justify-center mb-6">
                  <Form noFormatting={true} onSubmit={async (values) => {}}>
                    <LabeledToggleGroupField
                      // name={`formQuestion-${fq.id}-behaviour`}
                      name="currency"
                      paddingX={3}
                      paddingY={1}
                      // defaultValue={}
                      value={selectedCurrency}
                      options={Object.keys(Currency).map((currency) => {
                        return { label: currency, value: currency }
                      })}
                      onChange={async (value) => {
                        setSelectedCurrency(value)
                      }}
                    />
                  </Form>
                </div> */}
              </div>
            </div>

            <div className="w-full flex flex-row items-center justify-center text-center">
              <div className="flex flex-col space-y-5 w-full md:w-2/3 lg:w-2/3 text-lg md:text-2xl lg:text-3xl font-semibold">
                <span>Create jobs, invite admins & interviewers,</span>
                <span>Keep a track of candidates,</span>
                <span>
                  All with <span className="bg-yellow-300">flat pricing!</span>
                </span>
                <span className="px-6 text-center">
                  <span className="font-normal text-base">
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
                    {/* We would be happy to provide you{" "}
                    <span className="bg-yellow-300 font-semibold">refunds on yearly plan</span>{" "}
                    should you wish to cancel{" "}
                    <span className="bg-yellow-300 font-semibold">after 1 month of usage</span> */}
                  </span>
                </span>
              </div>
            </div>

            {/* <div className="w-full mt-10">
              We would be happy to provide you&nbsp;
              <span className="bg-yellow-300 font-semibold whitespace-nowrap">
                refunds on yearly plan
              </span>
              &nbsp;should you wish to cancel after 1 month of usage
            </div> */}
          </div>
        </section>

        {/* <section id="reviews" className="bg-gray-100 py-8 mt-16">
          <div className="container mx-auto px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              <span>{`Don't believe us, believe them!`}</span>
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
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

        <section id="support" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Friendly folks standing by!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl font-bold px-2">
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
        </section>

        <section id="sign-up" className="bg-gray-100 py-8 px-4 mt-16">
          <div className="text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              It only takes 5 minutes!
            </h2>

            <div className="w-full text-center pt-4">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl font-bold">
                  Get your <span className="bg-yellow-300">interviewing kit</span> with{" "}
                  <span className="bg-yellow-300">careers page</span> up and running now
                </span>
              </div>
              <div className="mt-6">
                <Link prefetch={true} href={Routes.SignupPage()}>
                  <a>
                    <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 mx-auto lg:mx-0 hover:underline text-white font-extrabold rounded my-2 md:my-6 py-3 lg:py-4 px-8 shadow-lg w-48">
                      Sign Up
                    </button>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  )
}
