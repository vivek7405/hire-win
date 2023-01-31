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
  CheckIcon,
  ExternalLinkIcon,
  XIcon,
} from "@heroicons/react/outline"
import { useRouter } from "next/router"
import getCookie from "src/core/utils/getCookie"
import { REFERRER_ID_COOKIE_NAME } from "src/core/constants"

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
            The Most Simple, Yet Powerful Hiring Solution
          </h1>
          <p className="mt-2 text-gray-800 text-base md:text-xl lg:text-2xl">
            The simplest way to list jobs, receive applicants and conduct interviews!
          </p>
          <p className="mt-8 text-gray-800 text-sm md:text-lg lg:text-xl italic">
            Traditionally, an Applicant Tracking System (ATS)
          </p>

          <div className="w-full flex items-center justify-center my-8">
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
          </div>

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

          {/* Uncomment this once you want to provide google signup */}
          <div className="w-full flex items-center justify-center mt-8">
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
          </div>

          <div className="mt-8 mb-4 w-full flex items-center justify-center">
            <a
              target="_blank"
              rel="referrer"
              href="https://www.indeed.com/hire/c/info/creating-an-interview-kit"
              className="text-xl lg:text-2xl text-black font-bold hover:underline flex items-center justify-center space-x-2"
            >
              <span>
                You get a pre-built Interview Kit that can be fully customized. Click to read its
                significance
              </span>
              <ArrowNarrowRightIcon className="hidden md:block w-7 h-7" />
            </a>
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
        </section>

        <section id="careers-page" className="mx-3 sm:mx-10 mt-10">
          <h1 className="text-center font-bold text-xl lg:text-2xl">
            You get an instant Careers Page with{" "}
            <span className="bg-yellow-200 rounded-tl-xl rounded-br-xl px-1">
              customizable theme color
            </span>
            :
          </h1>
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
