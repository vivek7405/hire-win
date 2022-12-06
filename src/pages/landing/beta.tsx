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

export default function Beta({}) {
  return (
    <LandingLayout title="hire-win | Beta">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl text-center">hire.win | BETA</h1>
      </div>
      <section id="beta" className="bg-gray-100 py-8 mt-16">
        <div className="px-2 pb-6 text-neutral-800">
          <div className="w-full text-center pt-2">
            <div className="mt-1 lg:px-14">
              <span className="text-2xl lg:text-3xl font-bold">We are still a BETA software</span>
            </div>
          </div>

          {/* <div className="w-full text-center mt-10">
            <div className="mt-1 lg:px-14">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/users/vivek7405/projects/5/views/1"
                className="text-4xl font-bold bg-yellow-300 hover:underline"
              >
                BETA Tracker
              </a>
              <br />
            </div>
          </div> */}

          <div className="w-full flex flex-row items-center lg:px-28 mt-10">
            <div className="flex flex-col space-y-5 w-full text-lg">
              <ul className="px-6 space-y-6 text-justify">
                {/* <li>
                  - <span className="font-semibold">Expect a few bugs</span> until we are running on
                  beta. You may check the{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://github.com/users/vivek7405/projects/5/views/1"
                    className="hover:underline"
                  >
                    BETA Tracker
                  </a>{" "}
                  to view the status of known bugs.
                </li> */}
                <li>
                  - <span className="font-semibold">Expect a few bugs</span> until we are running on
                  beta.
                </li>
                <li>
                  - Visit our{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://hirewin.tawk.help"
                    className="underline font-bold"
                  >
                    Hep Center
                  </a>{" "}
                  to submit a ticket if you encounter a bug.
                </li>
                {/* <li>
                  - We will stay running on beta{" "}
                  <span className="font-semibold">till 16th November, 2022 11:59 PM IST</span>
                </li>
                <li>
                  - Redeem the{" "}
                  <span className="bg-yellow-300">
                    coupon code <span className="font-bold">BETA30</span>
                  </span>{" "}
                  while subscribing to the PRO plan and get{" "}
                  <span className="font-bold">30% off for 3 consecutive months</span>. This coupon
                  code can be applied anytime before the BETA period ends. Consider it as a token of
                  appreciation for subscribing to the PRO plan while we are running on beta.
                </li>
                <li>
                  - Lastly, you may report us any bugs that you encounter by writing to{" "}
                  <span className="bg-yellow-300">support@hire.win</span>
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
