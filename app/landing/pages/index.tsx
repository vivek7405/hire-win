import { GetServerSidePropsContext, GetStaticPropsContext, Head, Image, Link, Routes } from "blitz"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import LogoBrand from "app/assets/LogoBrand"
import { useState } from "react"
import LandingLayout from "app/core/layouts/LandingLayout"

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

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {},
  }
}

export default function Home() {
  const [imageIndex, setImageIndex] = useState(0)
  const imageArray = [
    <img key="jobs" alt="Dashboard Job Listing" src="/screenshots/Jobs.png" />,
    <img key="kanban board" alt="Dashboard Job Listing" src="/screenshots/Kanban Board.png" />,
    <img
      key="candidates table"
      alt="Dashboard Job Listing"
      src="/screenshots/Candidates Table.png"
    />,
    <img key="job edit" alt="Dashboard Job Listing" src="/screenshots/Job Edit.png" />,
    <img key="job members" alt="Dashboard Job Listing" src="/screenshots/Job Members.png" />,
    <img
      key="candidate detail"
      alt="Dashboard Job Listing"
      src="/screenshots/Candidate Detail.png"
    />,
    <img key="form" alt="Dashboard Job Listing" src="/screenshots/Form.png" />,
    <img key="workflows" alt="Dashboard Job Listing" src="/screenshots/Workflows.png" />,
    <img key="workflow" alt="Dashboard Job Listing" src="/screenshots/Workflow.png" />,
    <img key="score card" alt="Dashboard Job Listing" src="/screenshots/Score Card.png" />,
    <img
      key="interview scheduling"
      alt="Dashboard Job Listing"
      src="/screenshots/Interview Scheduling.png"
    />,
    <img
      key="company settings"
      alt="Dashboard Job Listing"
      src="/screenshots/Company Settings.png"
    />,
    <img key="schedules" alt="Dashboard Job Listing" src="/screenshots/Schedules.png" />,
    <img key="calendars" alt="Dashboard Job Listing" src="/screenshots/Calendars.png" />,
  ]

  return (
    <LandingLayout>
      <div className="container mx-auto h-full mt-3">
        <div className="text-center">
          <h1 className="my-4 text-3xl lg:text-5xl font-black leading-tight">
            Interviewing Kit with Careers Page
          </h1>
          <p className="leading-normal text-neutral-800 text-xl lg:text-3xl mb-8">
            Applicant Tracking, Collaborating, Interviewing & more!
          </p>

          <Link href={Routes.SignupPage()}>
            <a>
              <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 mx-auto lg:mx-0 hover:underline text-white font-extrabold rounded my-2 md:my-6 py-3 lg:py-4 px-8 shadow-lg w-48">
                Sign Up
              </button>
            </a>
          </Link>
          <Link href={Routes.LoginPage()}>
            <a className="inline-block mx-auto lg:mx-0 hover:underline bg-transparent text-neutral-600 font-extrabold py-2 lg:py-4 px-8">
              Login
            </a>
          </Link>
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
                  ? "https://hire.win/basecamp"
                  : "http://localhost:3000/Padason"
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
                  ? "https://hire.win/basecamp/Software-Engineer"
                  : "http://localhost:3000/Padason"
              }
              title="Job Board"
              className="w-full h-full rounded-b-lg"
            ></iframe>
          </div>
        </div>

        <section id="screenshots" className="py-8">
          <h1 className="text-center pt-8 pb-4 lg:pb-8 font-bold text-3xl lg:text-5xl">
            Pictures speak louder than words!
          </h1>

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
          <div className="flex flex-col space-y-12 mt-3">
            {imageArray.map((image, index) => {
              return (
                <span hidden={index !== imageIndex} key={image.key}>
                  {image}
                </span>
              )
            })}
          </div>
        </section>

        <section id="pricing" className="bg-gray-100 py-8 mt-8">
          <div className="container mx-auto px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Pricing?
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <div className="mt-1">
                <span className="text-2xl lg:text-3xl font-bold">
                  <span className="bg-yellow-300">No nonsense</span> per user per job pricing
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row lg:flex-row justify-center my-12 md:space-x-8 lg:space-x-8 space-y-8 md:space-y-0 lg:space-y-0">
              <div className="text-black flex flex-col w-5/6 lg:w-1/3 mx-auto lg:mx-0 rounded-lg bg-white bg-gradient-to-br md:bg-gradient-to-bl lg:bg-gradient-to-bl from-pink-100 via-violet-100 to-indigo-200 shadow hover:shadow-lg">
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
                  <div className="w-full py-6 text-4xl font-bold text-center">$0.00</div>
                </div>
              </div>
              <div className="text-black flex flex-col w-5/6 lg:w-1/3 mx-auto lg:mx-0 rounded-lg bg-white bg-gradient-to-br from-red-100 via-purple-100 to-indigo-300 shadow hover:shadow-lg">
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
                  <div className="w-full py-6 text-4xl font-bold text-center">
                    <span className="text-base">Flat</span> $29.99{" "}
                    <span className="text-base">/ month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row items-center justify-center text-center">
              <div className="flex flex-col space-y-5 w-full md:w-2/3 lg:w-2/3 text-lg md:text-2xl lg:text-3xl font-semibold">
                <span>Create jobs, invite admins & interviewers,</span>
                <span>Keep a track of candidates,</span>
                <span>All with flat pricing!</span>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="bg-gray-100 py-8 mt-16">
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
        </section>

        <section id="support" className="bg-gray-100 py-8 mt-16">
          <div className="container mx-auto px-2 pb-6 text-neutral-800">
            <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
              Friendly folks standing by!
            </h2>
            <div className="w-full mb-4">
              <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
            </div>

            <div className="w-full text-center pt-2">
              <div className="mt-1">
                <span className="text-2xl md:text-3xl lg:text-3xl font-bold">
                  Write us at <span className="bg-yellow-300">support@hire.win</span> for any
                  queries
                </span>
              </div>
              <div className="mt-10 px-28">
                {`If it's an issue with your account or you need to report a bug, make sure you attach a screenshot with appropriate details. We'll respond to you as soon as we can!`}
              </div>
            </div>
          </div>
        </section>

        <section id="sign-up" className="bg-gray-100 py-8 mt-16">
          <div className="container mx-auto text-neutral-800">
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
                <Link href={Routes.SignupPage()}>
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

        {/* <section className="bg-white border-b py-12">
              <div className="container mx-auto flex flex-wrap items-center justify-between pb-12">
                <h2 className="w-full my-2 text-xl font-black leading-tight text-center text-neutral-800 lg:mt-8">
                  Our Customers / Featured in
                </h2>
                <div className="w-full mb-4">
                  <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
                </div>

                <div className="flex flex-1 flex-wrap max-w-4xl mx-auto items-center justify-center lg:justify-between text-xl text-neutral-500 font-bold opacity-75">
                  <span className="w-1/2 p-4 md:w-auto flex items-center justify-center">
                    <svg
                      className="h-10 w-10 mr-4 fill-current text-neutral-500 opacity-75"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7 0H6L0 3v6l4-1v12h12V8l4 1V3l-6-3h-1a3 3 0 0 1-6 0z" />
                    </svg>
                    TeeShirtz
                  </span>

                  <span className="w-1/2 p-4 md:w-auto flex items-center justify-center">
                    <svg
                      className="h-10 w-10 mr-4 fill-current text-neutral-500 opacity-75"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15.75 8l-3.74-3.75a3.99 3.99 0 0 1 6.82-3.08A4 4 0 0 1 15.75 8zM1.85 15.3l9.2-9.19 2.83 2.83-9.2 9.2-2.82-2.84zm-1.4 2.83l2.11-2.12 1.42 1.42-2.12 2.12-1.42-1.42zM10 15l2-2v7h-2v-5z" />
                    </svg>
                    Mic.Check
                  </span>

                  <span className="w-1/2 p-4 md:w-auto flex items-center justify-center">
                    <svg
                      className="h-10 w-10 mr-4 fill-current text-neutral-500 opacity-75"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 2.75V20l-4-4-4 4v-8.25a6.97 6.97 0 0 0 8 0z" />
                    </svg>
                    BadgeLife.io
                  </span>

                  <span className="w-1/2 p-4 md:w-auto flex items-center justify-center">
                    <svg
                      className="h-10 w-10 mr-4 fill-current text-neutral-500 opacity-75"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15.3 14.89l2.77 2.77a1 1 0 0 1 0 1.41 1 1 0 0 1-1.41 0l-2.59-2.58A5.99 5.99 0 0 1 11 18V9.04a1 1 0 0 0-2 0V18a5.98 5.98 0 0 1-3.07-1.51l-2.59 2.58a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41l2.77-2.77A5.95 5.95 0 0 1 4.07 13H1a1 1 0 1 1 0-2h3V8.41L.93 5.34a1 1 0 0 1 0-1.41 1 1 0 0 1 1.41 0l2.1 2.1h11.12l2.1-2.1a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41L16 8.41V11h3a1 1 0 1 1 0 2h-3.07c-.1.67-.32 1.31-.63 1.89zM15 5H5a5 5 0 1 1 10 0z" />
                    </svg>
                    Bugz 4 Life
                  </span>
                </div>
              </div>
            </section> */}

        {/* <section id="features" className="bg-gray-100 border-b py-8">
              <div className="container mx-auto flex flex-wrap pt-4">
                <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-neutral-800">
                  Features
                </h2>
                <div className="w-full mb-4">
                  <div className="h-1 mx-auto gradient w-64 opacity-25 my-0 py-0 rounded-t"></div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-gray-200 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        Free & Pro (1 job in Free)
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6 flex items-center">
                        Unlimited Jobs & Applicants
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Create as many jobs as you want with the Pro plan. The Free plan is limited
                        to 1 job. There is no limit on the number of applicants you can receive.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-indigo-100 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">Pro</p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Unlimited users/interviewers per job
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-gray-200 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        Free & Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Job Board with Theme Customization
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Automated Job Board that lists your active jobs. Customise the theme based
                        on your company branding.
                      </p>
                    </a>
                  </div>
                </div>
              </div>

              <div className="container mx-auto flex flex-wrap">
                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-gray-200 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        Free & Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Fully Customizable Job Application Form
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-indigo-100 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">Pro</p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Automatic Job Posting to Google Jobs
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-gray-200 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        Free & Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Embeddable Job Board Widget
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>
              </div>

              <div className="container mx-auto flex flex-wrap pb-12">
                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-pink-100 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        COMING SOON - Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Resume Parser
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-pink-100 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        COMING SOON - Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Applicant Tracking With Kanban Board
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>

                <div className="w-full md:w-1/3 p-6 flex flex-col flex-grow flex-shrink">
                  <div className="flex-1 bg-pink-100 rounded-t rounded-b-none overflow-hidden shadow">
                    <a className="flex flex-wrap no-underline hover:no-underline">
                      <p className="w-full text-neutral-600 text-xs md:text-sm px-6 mt-6">
                        COMING SOON - Pro
                      </p>
                      <div className="w-full font-bold text-xl text-neutral-800 px-6">
                        Interview Scheduling
                      </div>
                      <p className="text-neutral-600 text-base px-6 mb-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu
                        nunc commodo posuere et sit amet ligula.
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </section> */}

        {/* <section className="p-1 w-full mx-auto text-center bg-gray-100">
              <div className="m-3 py-6 bg-gradient-to-tr from-fuchsia-200 via-violet-300 to-indigo-400">
                <h2 className="w-full my-2 text-5xl font-black leading-tight text-center text-white">
                  It only takes 5 mins
                </h2>
                <div className="w-full mb-4">
                  <div className="h-1 mx-auto bg-white w-1/6 opacity-25 my-0 py-0 rounded-t"></div>
                </div>

                <h3 className="my-4 mx-3 text-3xl font-extrabold">
                  Get your Careers page up and Running now!
                </h3>

                <Link href={Routes.SignupPage()}>
                  <a>
                    <button className="mx-auto lg:mx-0 hover:underline bg-white text-white font-bold rounded my-6 py-4 px-8 shadow-lg">
                      Sign Up
                    </button>
                  </a>
                </Link>
              </div>
            </section> */}

        {/* <section id="compareWithOthers" className="bg-neutral-100 border-b py-8">
              <div className="container max-w-5xl mx-auto m-8">
                <h2 className="w-full my-2 px-3 text-5xl font-black leading-tight text-center text-neutral-800">
                  hireWIN - Who is it for?
                </h2>
                <div className="w-full mb-4">
                  <div className="h-1 mx-auto gradient w-64 md:w-96 lg:w-96 opacity-25 my-0 py-0 rounded-t"></div>
                </div>

                <div className="lg:mt-6 flex flex-wrap justify-center lg:justify-start">
                  <div className="w-5/6 lg:w-1/2 p-6">
                    <h3 className="text-center lg:text-left text-2xl text-neutral-800 font-bold mb-3">
                      Relatively smaller companies struggling with Applicant Tracking
                    </h3>
                    <p className="text-justify text-neutral-600 text-lg lg:mb-8">
                      Smaller companies using Email or Airtable Forms for receiving job applications
                      will find the most value out of hireWIN
                      <br />
                      <br />
                      The smaller companies typically need to go through 100s of candidates before
                      selecting a few of them. {"That's"} exactly where hireWIN will save you ample
                      time!
                    </p>
                  </div>
                  <div className="w-full lg:w-1/2 p-6">
                    <svg
                      className="w-full h-64 mx-auto"
                      viewBox="0 0 561.54772 636.42312"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Applicant Tracking</title>
                      <path
                        d="M592.15781,398.761h81.43311a1,1,0,0,0,0-2H592.15781a1,1,0,0,0,0,2Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#3f3d56"
                      />
                      <path
                        d="M629.67393,303.58269a7.74427,7.74427,0,0,0-3.48552,10.22377,7.42858,7.42858,0,0,0,.63322,1.05238L611.4891,337.10406l8.55036,11.75148,17.709-32.744a7.72281,7.72281,0,0,0,1.98883-9.21623,7.3907,7.3907,0,0,0-9.88217-3.40406Q629.76392,303.53572,629.67393,303.58269Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#ffb6b6"
                      />
                      <path
                        d="M538.715,308.06663l0,0a13.37258,13.37258,0,0,0-3.88835,19.86063l19.03209,24.27643,42.13954,31.149s29.67783-25.92733,29.91566-33.98608-2.93811-9.76563.23782-8.05875,6.06774.42724,4.97753-.47355-.70564-1.00066-.04449-2.5387,2.9847-8.7907,2.9847-8.7907l-11.57268-9.44641s-10.802,6.55251-11.51336,9.63373,3.17594,1.70688-.71137,3.08123-9.63622-2.63463-5.03173,1.71655,4.45878,6.44526.64432,6.77257-9.83589,10.94532-9.83589,10.94532l-41.158-41.90195A13.37259,13.37259,0,0,0,538.715,308.06663Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <path
                        d="M534.57908,767.36337H408.20115a9.82225,9.82225,0,0,1-9.811-9.81055V651.17391a9.82224,9.82224,0,0,1,9.811-9.81054H534.57908a9.82223,9.82223,0,0,1,9.811,9.81054V757.55282A9.82224,9.82224,0,0,1,534.57908,767.36337Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#f2f2f2"
                      />
                      <polygon
                        points="22.874 487.734 22.824 498.75 66.241 504.189 66.314 487.929 22.874 487.734"
                        fill="#ffb6b6"
                      />
                      <path
                        d="M346.50068,616.79417l1.01461,18.40311-7.88255-.03578L327.473,652.59828a4.9238,4.9238,0,0,1-8.96283-2.83857l.09942-21.90366,7.81419-3.74-7.79036-1.5095.03748-8.25856Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M703.96339,390.03562c-26.6619-6.63657-49.55269-19.682-67.44794-41.21723a6.04124,6.04124,0,0,1-2.00248-8.29565l31.12817-50.93817a6.0412,6.0412,0,0,1,8.29563-2.00246l67.44794,41.21724a6.04122,6.04122,0,0,1,2.00251,8.29562l-31.12817,50.93817A6.04122,6.04122,0,0,1,703.96339,390.03562Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <path
                        d="M685.979,373.679c-14.03813-1.53249-28.62794-12.75237-43.36166-26.49818a5.65768,5.65768,0,0,1-1.87538-7.76914l26.752-43.77706a5.65793,5.65793,0,0,1,7.76928-1.87564l60.01949,36.67774a5.65791,5.65791,0,0,1,1.87524,7.76937l-16.57233,27.119A25.202,25.202,0,0,1,685.979,373.679Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#fff"
                      />
                      <path
                        d="M698.28789,321.07823,677.523,355.27068a2.40023,2.40023,0,1,1-4.10309-2.4918l20.76493-34.19245a2.40023,2.40023,0,1,1,4.10309,2.4918Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M707.307,326.55551,686.5421,360.748a2.40023,2.40023,0,0,1-4.10309-2.49179l20.76493-34.19245a2.40023,2.40023,0,0,1,4.10309,2.49179Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M566.89011,435.86337s-4.38,67.54-8,78c-3.93,11.32-3.42,28.5-9.32,44.95-1.82,5.07995-3.68,10.23-5.54,15.34-.37,1.03-.75,2.06-1.12,3.09-2.43,6.65-4.86,13.19-7.18,19.37-.33.87-.66,1.73-.98,2.57995-.01.02-.01.04-.02.05005-7.66,20.15-14.22,36-16.84,38.62-2.8,2.8-21.72,3.96-45.1,4.28-43.33.58-101.99-1.71-101.99-1.71l.09-23.57s.52-.15,1.49-.44c1.79-.52,5.12-1.49,9.47-2.78,18.17-5.36,54.18-16.15,70.67-22.11,4.66-1.68,7.76-2.98,8.46-3.67,4.1-4,5.91,0,8.51,4,2.6,4,3.4,0,6.8-2.94,3.4-2.94,11.06,1.1,11.06,1.1s.07-2.66.18-6.9c.16-6.26.4-16,.64-25.75-.01-.01-.01-.01,0-.01.09-3.67005.18-7.34.26-10.82.07-2.7.13-5.29.19-7.69.16-7.19.27-12.63.27-13.99,0-4.44,0-.99,3.51-3.67005a15.67285,15.67285,0,0,0,1.49-1.32995,17.32066,17.32066,0,0,0,2.06-2.2c.26-.56-1.35.2-3.44-.22a6.3166,6.3166,0,0,1-3.03-1.55c-4.41-3.97.35-16.15.35-16.15-10.02-20.04-9.3-36.48-4.61-49.14a63.00711,63.00711,0,0,1,16.26-23.83,59.50548,59.50548,0,0,1,8.9-6.98l.31-1.65,3.39-18.32995a38.51174,38.51174,0,0,1,24.38-4.43006,56.3,56.3,0,0,1,17.99,5.83,66.76979,66.76979,0,0,1,12.85,8.44Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <polygon
                        points="156.242 609.949 167.212 610.969 176.454 568.2 160.264 566.695 156.242 609.949"
                        fill="#ffb6b6"
                      />
                      <path
                        d="M506.35014,758.62338l-16.3-13.65.73-7.85-3.79-.13-11.75-.38-2.88-.1-4.88995,27.51,8.23.76,2.19-7.63,3.03,8.12,21.81,2.03a4.9262,4.9262,0,0,0,3.62-8.68Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M535.73014,596.61337c-4.17,22.72-21.84,75.97-32.52,107.14-4.87,14.24-8.27,23.87994-8.27,23.87994l-5.55-1.75-9.36-2.96-3.42005-1.08-4.13995-1.31s.97-51.22.32-78.39c-.22-8.76-.6-15.01995-1.23-16.26-2.6-5.1,1.75-5.63995,6.34-6.93,4.6-1.29,1.01-3.23-.78-7.37-1.21-2.76,1.17005-6.43,2.86005-8.53a20.69953,20.69953,0,0,1,1.49-1.69s-11.7-3.98005-24.93-8.47c-.01.01-.01,0-.01,0-1.33-.45-2.67005-.9-4.01-1.36,4.66-1.68,7.76-2.98,8.46-3.67,4.1-4,5.91,0,8.51,4,2.6,4,3.4,0,6.8-2.94,3.4-2.94,11.06,1.1,11.06,1.1s.07-2.66.18-6.9c.16-6.26.4-16,.64-25.75-.01-.01-.01-.01,0-.01.09-3.67005.18-7.34.26-10.82,7.05,5.4,13.89,10.7,20.09,15.6.01.01.03.02.03.04,14.91,11.78,26.1,21.24,27.67,24.24C536.93009,587.78335,536.6901,591.39333,535.73014,596.61337Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M494.79119,424.73488c-4.688-1.43009-9.61695,3.398-9.47423,8.29717s4.05481,9.04669,8.56137,10.97369,75.94495,13.95811,81.23128,11.23991,9.12727-9.238,6.793-14.70476c-1.50322-3.52041-4.744-19.88885-7.6186-22.41669-9.67617-8.50906-.79647-19.608,5.17825-31.02442,5.28468-10.09792,16.67872-17.8219,16.56534-29.21852-.08149-8.1913-6.2772-14.8653-12.07846-20.64885L565.50446,318.844l-17.51011-17.45667c-3.74175-3.73034-19.79406-5.70364-22.66812-3.97019-6.00633,3.62263-20.86818,63.98136-22.99181,69.48638-.68188,1.76763,3.74927,24.3886,5.55569,24.95982,4.99161,15.81755-3.78642,18.87019-13.32841,32.43712"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <path
                        d="M638.09128,333.36345a7.74429,7.74429,0,0,0-5.68285,9.18583,7.42941,7.42941,0,0,0,.38194,1.16731l-19.91744,18.25464,5.70691,13.36552,24.58082-27.95648a7.72278,7.72278,0,0,0,3.99879-8.53837,7.39068,7.39068,0,0,0-8.87109-5.52708Q638.1895,333.33779,638.09128,333.36345Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#ffb6b6"
                      />
                      <path
                        d="M548.43192,317.4l0,0a13.37258,13.37258,0,0,0-8.22982,18.48875L553.3255,363.8054l34.1097,39.781s34.72283-18.63666,36.75618-26.43829-.68064-10.1753,2.03334-7.80164,5.81867,1.77288,4.95742.65117-.46408-1.13308.52417-2.48439,4.87433-7.901,4.87433-7.901l-9.168-11.79443s-11.99343,3.97189-13.37561,6.81611,2.714,2.37366-1.38219,2.84421-8.80337-4.72214-5.28812.54827,2.9051,7.27891-.886,6.74521-12.03381,8.4695-12.03381,8.4695l-30.74913-50.04242A13.37257,13.37257,0,0,0,548.43192,317.4Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <circle cx="218.48235" cy="128.05389" r="29.89763" fill="#ffb6b6" />
                      <path
                        d="M513.89011,237.86337c.30768-2.69066,2.15182-6.01618,3.43459-8.40131s3.75986-4.33293,6.46294-4.16671a6.89389,6.89389,0,0,1,5.28144,3.58917,14.45722,14.45722,0,0,1,1.64289,6.38285,33.42934,33.42934,0,0,1-10.87013,26.61787c-2.0954,1.87931-4.61715,3.5518-7.43113,3.61545a9.58515,9.58515,0,0,1-6.78842-3.05324c-4.55482-4.5616-5.24355-12.06085-2.811-18.03054s3.51812-8.29263,9.07879-11.55354"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M555.89011,280.86337c-.5,2.66,4.1,15.31,2.63,17.59,0,0-15.22142,5.28689-21.04143,5.66689-7.11.46-12.82857-2.45687-19.47859-6.84688a14.93,14.93,0,0,0-2.01-6.76,9.04542,9.04542,0,0,1-.94,4.62c-9.74-7.75994-13.3961-29.09914-3.7661-39.00912l10-23c-3,1,6.05614-14.45084,15.60612-3.26083,11.95-12.17005,35.09981,5.34987,38.0002,21-2.791-3.53247-4.24463-3.116-4.96045-.67993a13.77522,13.77522,0,0,0-3.79976-5.31007,11.5133,11.5133,0,0,1,1.24,5.31c-18.85,1.17-15.34159,13.8868.1086,32.93685-5.71338-3.55664-1.85791,11.76978-4.90869,15.43311C562.4201,295.99327,556.43009,283.35336,555.89011,280.86337Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M750.457,590.86337h81.4331a1,1,0,0,0,0-2H750.457a1,1,0,0,0,0,2Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#3f3d56"
                      />
                      <path
                        d="M715.457,251.86337h81.4331a1,1,0,0,0,0-2H715.457a1,1,0,0,0,0,2Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#3f3d56"
                      />
                      <path
                        d="M779.05683,234.39054c-16.51077-21.96122-26.0537-46.51942-26.36641-74.51776a6.04125,6.04125,0,0,1,3.67595-7.70164l56.27746-19.91249a6.04122,6.04122,0,0,1,7.70161,3.676l26.3664,74.51777a6.04121,6.04121,0,0,1-3.67591,7.70162l-56.27746,19.91249A6.04121,6.04121,0,0,1,779.05683,234.39054Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <path
                        d="M775.4099,210.35566c-9.93022-10.04034-14.1809-27.94788-16.95072-47.90679a5.65769,5.65769,0,0,1,3.44264-7.21282l48.36574-17.1131a5.65791,5.65791,0,0,1,7.21308,3.44253l23.46251,66.31068a5.65791,5.65791,0,0,1-3.4429,7.21291l-29.96157,10.60122A25.202,25.202,0,0,1,775.4099,210.35566Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#fff"
                      />
                      <path
                        d="M818.12805,177.28736l-37.67558,13.44829a2.40023,2.40023,0,0,1-1.6138-4.52107l37.67559-13.44829a2.40023,2.40023,0,0,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M784.316,175.38008l-8.28863,2.95862a2.40023,2.40023,0,1,1-1.61379-4.52107l8.28863-2.95862a2.40023,2.40023,0,0,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M825.22271,197.16317l-37.67558,13.44829a2.40023,2.40023,0,0,1-1.61379-4.52107l37.67558-13.44829a2.40023,2.40023,0,0,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M821.67538,187.22527,783.9998,200.67355a2.40023,2.40023,0,0,1-1.6138-4.52107l37.67559-13.44828a2.40023,2.40023,0,1,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <circle cx="437.37998" cy="25.95072" r="10" fill="#6c63ff" />
                      <path
                        d="M812.05683,572.39054c-16.51077-21.96122-26.0537-46.51942-26.36641-74.51776a6.04125,6.04125,0,0,1,3.67595-7.70164l56.27746-19.91249a6.04122,6.04122,0,0,1,7.70161,3.676l26.3664,74.51777a6.04121,6.04121,0,0,1-3.67591,7.70162l-56.27746,19.91249A6.04121,6.04121,0,0,1,812.05683,572.39054Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#e6e6e6"
                      />
                      <path
                        d="M808.4099,548.35566c-9.93022-10.04034-14.1809-27.94788-16.95072-47.90679a5.65769,5.65769,0,0,1,3.44264-7.21282l48.36574-17.1131a5.65791,5.65791,0,0,1,7.21308,3.44253l23.46251,66.31068a5.65791,5.65791,0,0,1-3.4429,7.21291l-29.96157,10.60122A25.202,25.202,0,0,1,808.4099,548.35566Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#fff"
                      />
                      <path
                        d="M851.12805,515.28736l-37.67558,13.44829a2.40023,2.40023,0,0,1-1.6138-4.52107l37.67559-13.44829a2.40023,2.40023,0,0,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M817.316,513.38008l-8.28863,2.95862a2.40023,2.40023,0,0,1-1.61379-4.52107l8.28863-2.95862a2.40023,2.40023,0,1,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M854.67538,525.22527,816.9998,538.67355a2.40023,2.40023,0,0,1-1.6138-4.52107l37.67559-13.44828a2.40023,2.40023,0,1,1,1.61379,4.52107Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <circle cx="472.37998" cy="362.95072" r="10" fill="#6c63ff" />
                      <circle cx="314.08079" cy="172.84836" r="10" fill="#6c63ff" />
                      <path
                        d="M528.68773,256.37037a1.00011,1.00011,0,0,1-.273-1.96191c.26221-.43262.15479-2.25342.06836-3.72461-.32519-5.52393-.86963-14.769,8.106-21.00977a.99976.99976,0,0,1,1.1416,1.6416c-8.05469,5.60108-7.57129,13.81543-7.251,19.25049.18262,3.10742.31494,5.352-1.56982,5.7793A.99351.99351,0,0,1,528.68773,256.37037Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M332.77144,767.14576a1.18647,1.18647,0,0,0,1.19006,1.19h253.29a1.19,1.19,0,0,0,0-2.38h-253.29A1.1865,1.1865,0,0,0,332.77144,767.14576Z"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#ccc"
                      />
                      <path
                        d="M529.15379,234.51435a56.40248,56.40248,0,0,0-19.20647-4.25648c-5.2367-.22192-11.48451.94577-13.6133,5.7354-1.29144,2.90564-.60343,6.31148.57791,9.26361s2.83917,5.74133,3.52323,8.84659c1.47365,6.68966-2.00452,13.77909-7.34264,18.07184s-12.2271,6.18709-19.02279,7.04834c5.10568,1.89432,10.28959,3.80662,15.71637,4.261s11.22244-.72533,15.27427-4.36389c4.3847-3.93747,6.0695-10.053,6.81534-15.89878s.78443-11.86628,2.766-17.41629,6.53338-10.71869,12.40595-11.21089"
                        transform="translate(-318.51013 -131.91264)"
                        fill="#2f2e41"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-6 lg:mt-0 flex flex-wrap flex-col-reverse lg:flex-row items-center lg:items-start">
                  <div className="w-full lg:w-1/2 p-6">
                    <svg
                      className="w-full h-64 mx-auto"
                      viewBox="0 0 852.18194 617.72966"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>Careers Page</title>
                      <rect x="688.01315" y="555.91177" width="104" height="60" fill="#6c63ff" />
                      <path
                        d="M752.36168,743.16566c-.93326,3.17542-1.36642,6.87817.572,9.56082a9.65556,9.65556,0,0,0,4.08648,2.99312,29.11229,29.11229,0,0,0,12.98474,1.90521,6.13154,6.13154,0,0,0,4.59336-1.7636,56.58649,56.58649,0,0,0,19.575-33.39261,3.16579,3.16579,0,0,0-.10416-2.04893,3.24712,3.24712,0,0,0-1.36351-1.15649,30.653,30.653,0,0,0-7.3105-3.33839C771.31676,712.29013,755.84981,731.29745,752.36168,743.16566Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M900.00393,698.66826a20.73239,20.73239,0,0,0,6.84363,5.21188,9.60793,9.60793,0,0,0,8.36427-.14239c3.873-2.20486,4.97016-7.3283,4.66109-11.7745-.57168-8.22318-4.49982-15.63344-9.014-22.35075-1.42824-2.12529-4.58989-8.45058-7.36467-8.52926-1.31813-.03743-6.24761,4.74185-7.58708,5.65154-4.89361,3.32336-8.28324,5.7011-7.26484,12.0804C889.77828,685.9304,895.2157,693.54492,900.00393,698.66826Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M857.09851,358.55776c-20.83282-1.61549-40.73176-1.0168-61.602-2.088-1.75348-.09-.90847,19.98632-2.72541,30.88795-.93384,5.60307-32.34844,333.83714-28.44922,334.5023a259.06214,259.06214,0,0,0,30.3305,4.49239c4.13352.36391,42.663-213.506,40.81676-230.88689,5.04453,7.39853,22.81211,41.55923,31.79641,80.85373,11.854,51.84585,15.34346,110.48854,22.71173,107.19934a44.13756,44.13756,0,0,1,18.61108-14.71954c12.17816-4.52965-7.55786-253.92383-28.41023-265.38931-.25656-7.29939-.52416-14.77808-3.27513-21.54413C873.02284,372.32214,865.36755,364.702,857.09851,358.55776Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#2f2e41"
                      />
                      <polygon
                        points="851.787 617.73 277.706 617.73 277.706 615.548 852.182 615.548 851.787 617.73"
                        fill="#3f3d56"
                      />
                      <rect y="294.36832" width="471.01315" height="92.99491" fill="#e6e6e6" />
                      <rect y="147.42601" width="471.01315" height="92.99489" fill="#e6e6e6" />
                      <rect width="471.01315" height="92.99489" fill="#e6e6e6" />
                      <path
                        d="M183.95009,224.08855H634.88131V151.17646H183.95009Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#fff"
                      />
                      <path
                        d="M183.95009,371.83891H634.88131v-72.9121H183.95009Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#fff"
                      />
                      <path
                        d="M183.95,518.457H634.88121V445.5449H183.95Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#fff"
                      />
                      <circle cx="49.51675" cy="45.89359" r="27.77768" fill="#6c63ff" />
                      <rect
                        x="115.94168"
                        y="35.02405"
                        width="274.15375"
                        height="6.03863"
                        fill="#6c63ff"
                      />
                      <rect
                        x="115.94168"
                        y="50.72448"
                        width="274.15375"
                        height="6.03863"
                        fill="#6c63ff"
                      />
                      <circle cx="49.51675" cy="194.52731" r="27.77768" fill="#ccc" />
                      <rect
                        x="115.94168"
                        y="183.65779"
                        width="274.15375"
                        height="6.03863"
                        fill="#ccc"
                      />
                      <rect
                        x="115.94168"
                        y="199.35822"
                        width="274.15375"
                        height="6.03863"
                        fill="#ccc"
                      />
                      <circle cx="49.51675" cy="341.46966" r="27.77769" fill="#ccc" />
                      <rect
                        x="115.94168"
                        y="330.60012"
                        width="274.15375"
                        height="6.03863"
                        fill="#ccc"
                      />
                      <rect
                        x="115.94168"
                        y="346.30056"
                        width="274.15375"
                        height="6.03863"
                        fill="#ccc"
                      />
                      <path
                        d="M851.96559,199.351c-10.81253-18.26981-32.20421-19.12126-32.20421-19.12126s-20.845-2.66564-34.21691,25.1595c-12.4637,25.9353-29.66522,50.97638-2.76929,57.04765l4.85817-15.12083L790.642,263.5626a105.2364,105.2364,0,0,0,11.50777.19667c28.80332-.92994,56.23416.27208,55.351-10.06377C856.32656,239.95545,862.3694,216.93018,851.96559,199.351Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#2f2e41"
                      />
                      <path
                        d="M812.07729,261.59811c.05229,2.05642.03665,4.22524-.98524,6.01055-2.02578,3.53923-6.97115,4.069-9.94583,6.85853-3.1283,2.93353-3.48236,7.69451-3.63146,11.98048-.15587,4.481-.28811,9.10879,1.34726,13.28362a32.29279,32.29279,0,0,0,3.77277,6.48169q2.72424,3.927,5.49883,7.8186a33.75927,33.75927,0,0,0,3.29259,4.132c3.31272,3.37443,7.8567,5.2423,12.39375,6.575,2.93137.86106,6.09649,1.53176,9.00493.59629a17.24036,17.24036,0,0,0,5.23659-3.22,28.0609,28.0609,0,0,0,5.92742-5.74508c2.44231-3.5428,3.11831-7.97785,3.62456-12.251a264.36284,264.36284,0,0,0,1.74255-38.08361,9.33377,9.33377,0,0,0-.7271-4.04639c-1.50628-2.94122-5.54064-3.56914-7.66639-6.09914-1.81747-2.16307-1.89158-5.25014-1.87608-8.07539l.03948-7.19234a3.01284,3.01284,0,0,0-.34955-1.75229,2.96857,2.96857,0,0,0-2.06313-.96257,69.54992,69.54992,0,0,0-13.5313-.90527c-3.672.1122-10.71751-.19515-13.89257,1.85-2.882,1.8564.72645,6.98361,1.394,9.86364A64.262,64.262,0,0,1,812.07729,261.59811Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#ffb8b8"
                      />
                      <circle cx="646.59652" cy="79.04091" r="29.07101" fill="#ffb8b8" />
                      <path
                        d="M813.92218,283.04694c-15.00419-47.548-22.90913,19.23731-32.36916,37.47249.08794,12.57282.42873,47.34691,3.36916,60.52751,11.42255,51.2019,67.98975,47.18234,85,4,9.06116-23.00281-11.03988-80.01159-10.35862-106.61165C834.65311,253.19426,833.116,333.27172,813.92218,283.04694Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#6c63ff"
                      />
                      <path
                        d="M797.4516,266.73761c-32.5112,15.80158-17.00106,58.25549-28.78537,86.03937-9.412,38.11869-33.34828,50.10538,21.37992,50.99288,11.79191-34.84244.274-72.68949,16.35195-108.16748,1.10709-13.89531,5.87311-19.12078,5.45081-30.88794C808.69672,259.83072,800.53,265.22464,797.4516,266.73761Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#575a88"
                      />
                      <polygon
                        points="673.276 56.455 652.142 45.384 622.957 49.913 616.919 76.583 631.95 76.004 636.149 66.206 636.149 75.842 643.084 75.576 647.111 59.977 649.626 76.583 674.283 76.079 673.276 56.455"
                        fill="#2f2e41"
                      />
                      <path
                        d="M834.11305,280.12007c16.73347-1.95292.41934-22.04869,13.70111-21.70725,39.771-6.68935,51.66932,17.94352,36.54421,52.32424-13.86474,27.5378,35.18011,66.22151,7.7812,81.63023-9.72368,3.56942-23.64729,14.79719-33.15053,9.90892C843.73161,363.92783,843.18033,320.11308,834.11305,280.12007Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#575a88"
                      />
                      <path
                        d="M880.688,389.59525c-5.82631,2.78637-10.43525,7.21738-14.3352,12.36516-.8256,1.08976.28174,3.12237,2.75591,3.08907,2.30214-.031,3.67748-2.98285,5.97954-3.01385a99.973,99.973,0,0,0,3.80585,18.14512c4.5928-4.03319,7.343-9.71068,9.97425-15.22764l5.20118-10.90548c1.90951-4.00372,3.8198-8.00921,5.541-12.0974a8.728,8.728,0,0,0,.85313-3.04923c.22651-7.03534-6.70988-7.078-9.70133-2.67506C887.49047,381.0417,886.47144,386.82923,880.688,389.59525Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#ffb8b8"
                      />
                      <path
                        d="M881.88418,268.64257c4.44717,4.62094,8.92552,9.28113,12.3778,14.686s21.30979,54.01449,22.03379,55.04514c2.57821,3.80469-.43333,13.64043-.58546,14.20364-.29826,1.76623-4.02357,19.403-4.957,23.29768-.65318,2.72541-.64487,5.56312-1.07237,8.33289s-1.38916,5.618-3.52262,7.43532a2.207,2.207,0,0,1-.97024.54292c-1.18333.23092-1.98941-1.138-2.40367-2.27026-1.28979-3.5255-2.592-7.11956-4.866-10.10644s-5.72077-5.32608-9.4748-5.31468a5.0553,5.0553,0,0,1,.36754-4.613c.75222-1.41868,1.85492-2.621,2.68463-3.99579a18.38916,18.38916,0,0,0,2.112-6.03621,39.606,39.606,0,0,0-5.22938-28.24962,27.05174,27.05174,0,0,0-4.36366-5.4545c-1.833-1.71777-3.97763-3.0988-5.67-4.95532a19.37342,19.37342,0,0,1-4.51165-10.94685,57.72075,57.72075,0,0,1,.3181-12.00988c.76131-7.901,1.7394-15.81349,2.868-23.67045a8.82792,8.82792,0,0,1,.78338-2.95616C878.6886,269.9544,880.18712,269.44,881.88418,268.64257Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#575a88"
                      />
                      <path
                        d="M784.82417,377.8045c-2.99145-4.40292-9.92784-4.36028-9.70133,2.67506a8.728,8.728,0,0,0,.85313,3.04923c1.72123,4.08819,3.63152,8.09368,5.541,12.0974l5.20118,10.90548c2.63123,5.517,5.38145,11.19445,9.97425,15.22764a99.973,99.973,0,0,0,3.80585-18.14512c2.30206.031,3.67741,2.98288,5.97955,3.01385,2.47417.0333,3.5815-1.99931,2.7559-3.08907-3.89995-5.14778-8.50888-9.57879-14.3352-12.36516C789.11509,388.40779,788.09605,382.62026,784.82417,377.8045Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#ffb8b8"
                      />
                      <path
                        d="M797.784,273.18552a8.82815,8.82815,0,0,1,.78337,2.95616c1.12857,7.857,2.10666,15.76945,2.868,23.67045a57.72007,57.72007,0,0,1,.31811,12.00988,19.3735,19.3735,0,0,1-4.51166,10.94685c-1.69234,1.85652-3.837,3.23755-5.67,4.95532a27.05174,27.05174,0,0,0-4.36366,5.4545,39.606,39.606,0,0,0-5.22938,28.24962,18.38947,18.38947,0,0,0,2.112,6.03621c.82971,1.37479,1.93241,2.57711,2.68463,3.99579a5.0553,5.0553,0,0,1,.36754,4.613c-3.754-.0114-7.20071,2.32781-9.4748,5.31468s-3.57626,6.58094-4.86605,10.10644c-.41426,1.13226-1.22034,2.50118-2.40367,2.27026a2.207,2.207,0,0,1-.97024-.54292c-2.13346-1.81736-3.09511-4.66555-3.52261-7.43532s-.4192-5.60748-1.07238-8.33289c-.93339-3.89468-4.6587-21.53145-4.957-23.29768-.15212-.56321-3.16367-10.399-.58545-14.20364.724-1.03065,18.5815-49.64032,22.03378-55.04514s7.93064-10.065,12.3778-14.68595C795.3994,271.01854,796.89793,271.533,797.784,273.18552Z"
                        transform="translate(-173.90903 -141.13517)"
                        fill="#575a88"
                      />
                    </svg>
                  </div>
                  <div className="w-5/6 lg:w-1/2 p-6">
                    <div className="align-middle">
                      <h3 className="text-center lg:text-left text-2xl text-neutral-800 font-bold mb-3">
                        Those who need a Careers Page or a Job Application Page
                      </h3>
                      <p className="text-justify text-neutral-600 text-lg lg:mb-8">
                        Just create jobs and you have your Job Board/Careers Page up and running
                        automatically. Embed it to your website in minutes or share it to social
                        media! You may embed/share links to individual jobs as well.
                        <br />
                        <br />
                        The Job Application form can be fully Customised for each job that you
                        create so that you ask relevant questions to the applicants.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}
      </div>
    </LandingLayout>
  )
}
