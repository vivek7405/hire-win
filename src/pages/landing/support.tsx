import { gSP } from "src/blitz-server"
import LandingLayout from "src/core/layouts/LandingLayout"
import path from "path"

export const getStaticProps = gSP(async function getStaticProps(context) {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  return {
    props: {},
  }
})

export default function Support({}) {
  return (
    <LandingLayout title="Hire.win | Support">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl text-center">Friendly Folks Standing By!</h1>
      </div>
      <section id="pricing" className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-2 pb-6 text-neutral-800">
          <div className="w-full text-center pt-2">
            <div className="mt-1 lg:px-14">
              <span className="text-2xl lg:text-3xl font-bold">
                {`Don't worry, we've got your back!`}
              </span>
              <br />
            </div>
          </div>

          <div className="w-full text-center mt-10">
            <div className="mt-1 lg:px-14">
              <span className="text-4xl font-bold bg-yellow-300">support@hire.win</span>
              <br />
            </div>
          </div>

          <div className="w-full flex flex-row items-center lg:px-28 mt-10">
            <div className="flex flex-col space-y-5 w-full text-lg">
              <ul className="px-6 space-y-6 text-justify">
                <li>
                  - <span className="font-semibold">We have witnessed the pain</span> of terrible
                  customer service experiences in the past and have made sure that {`doesn't`}{" "}
                  happen with our services.
                </li>
                <li>
                  - Be rest assured that{" "}
                  <span className="font-semibold">{`you're`} in good hands</span> and you can always
                  reach out to us for any queries and {`we'll`} be more than happy to assist you.
                </li>
                <li>
                  - Visit our{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://hirewin.tawk.help"
                    className="underline"
                  >
                    <span className="font-semibold">Hep Center</span>
                  </a>{" "}
                  to contact us.
                </li>
                {/* <li>
                  - Though, <span className="font-semibold">our support is limited to email</span>,
                  we shall be scheduling a video meet if absolutely necessary. If {`it's`} an issue
                  with your account or you need to report a bug, make sure you attach a screenshot
                  with appropriate details. {`We'll`} respond to you as soon as we can!
                </li>
                <li>
                  - Being a valuable customer of ours, we want you to know where we are located and{" "}
                  <span className="font-semibold">how you may reach to us</span>:
                  <div className="pl-6 flex flex-col mt-4 space-y-4">
                    <div>
                      📧 Shoot us an email at <span className="font-bold">support@hire.win</span>
                    </div>
                    <div>
                      🇮🇳 {`Here's`} <span className="font-semibold">our postal address</span>,
                      should you wish to visit us, {`we'll`} happily receive you with utmost
                      pleasure 😇
                      <br />
                      <div className="mt-2">
                        202, Parmeshwar Flat,
                        <br />
                        Opp. Champa Tower,
                        <br />
                        Near Rupani Diwadi,
                        <br />
                        Bhavnagar, Gujarat,
                        <br />
                        India - 364001
                        <br />
                        Tel. +91 79 4604 9362
                      </div>
                    </div>
                  </div>
                </li> */}
              </ul>
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
    </LandingLayout>
  )
}
