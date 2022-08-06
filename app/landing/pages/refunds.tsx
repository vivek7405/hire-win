import LandingLayout from "app/core/layouts/LandingLayout"
import { GetStaticPropsContext } from "blitz"
import path from "path"

export async function getStaticProps(context: GetStaticPropsContext) {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  return {
    props: {},
  }
}

export default function Refunds({}) {
  return (
    <LandingLayout title="hire-win | Refunds">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl text-center">Cancellation & Refund Policy</h1>
      </div>
      <section id="pricing" className="bg-gray-100 py-8 mt-16">
        <div className="container mx-auto px-2 pb-6 text-neutral-800">
          <div className="w-full text-center pt-2">
            <div className="mt-1 lg:px-14">
              <span className="text-2xl lg:text-3xl font-bold">
                We are pretty straightforward about our cancellation and refund policy
              </span>
            </div>
          </div>

          <div className="w-full text-center mt-10">
            <div className="mt-1 lg:px-14">
              <span className="text-4xl font-bold bg-yellow-300">billing@hire.win</span>
              <br />
            </div>
          </div>

          <div className="w-full flex flex-row items-center lg:px-28 mt-10">
            <div className="flex flex-col space-y-5 w-full text-lg">
              <ul className="px-6 space-y-6 text-justify">
                <li>
                  - Once you <span className="font-semibold">cancel the monthly plan</span>, you
                  will not be billed from the next month and your services shall pause
                </li>
                <li>
                  - We {`don't`} offer{" "}
                  <span className="font-semibold">refunds on monthly plan</span>
                </li>
                <li>
                  - If you <span className="font-semibold">cancel the yearly plan</span>, you will
                  not be billed from the next year and your services shall be put on hold
                </li>
                <li>
                  - We do provide <span className="font-semibold">refunds on yearly plan</span>{" "}
                  provided you stay subscribed for a minimum of 3 months after purchasing the
                  subscription. We can provide you a refund for the remaining months from the day
                  you wish to cancel once you let us know.
                </li>
                <li>
                  - For any billing related queries or to claim a refund, write us to{" "}
                  <span className="font-bold">billing@hire.win</span>
                </li>
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
