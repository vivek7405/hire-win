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

export default function OurStory({}) {
  return (
    <LandingLayout title="Hire.win | Our Story">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl text-center">Our Story</h1>
      </div>
      <section id="our-story" className="bg-gray-100 py-8 px-4 mt-16">
        <div className="text-neutral-800">
          <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
            What made us build hire.win?
          </h2>

          <div className="w-full text-center pt-4">
            <div className="mt-8 mb-4">
              <p className="text-md md:text-lg lg:text-xl text-justify px-4 md:px-10 lg:px-10">
                - Frankly, being a small IT Services company founded by freelancers, we did give a
                try to some ATS systems out there but their{" "}
                <span className="bg-yellow-200 font-medium">
                  hefty per user per job pricing models
                </span>{" "}
                incurred quite unpredictable costs varying each month. We just {"couldn't"} rely on
                such pricing models considering the size of our company, so we switched back to the
                various tools we used like Excel Sheets, Google Forms & others.
                <br />
                <br />- We also noticed that the{" "}
                <span className="bg-yellow-200 font-medium">
                  ATS systems we used were complicated and time-consuming
                </span>{" "}
                to use and our hiring managers rather {"didn't"} use them much even though we had
                bought the subscription.
                <br />
                <br />- The{" "}
                <span className="bg-yellow-200 font-medium">
                  problems that we ourselves faced
                </span>{" "}
                while interviewing and tracking candidates made us build this product. Initially, we
                used it internally and then released it to the world! We made sure it is as simple
                as possible to use. It comes with all the minimal defaults set, though it can be
                fully customised to meet your hiring needs.
                <br />
                <br />- Previously,{" "}
                <span className="bg-yellow-200 font-medium">
                  there was too much to and fro communication via email and chat
                </span>
                , whether it was figuring out the interviewer availability, creating a meeting in
                the calendar, getting candidate feedback from the interviewer, and what not.
                <br />
                <br />- Plus,{" "}
                <span className="bg-yellow-200 font-medium">
                  all the candidates & their data was scattered
                </span>{" "}
                across emails, excel sheets, google forms & various other tools we used, due to
                which we were not able to act upon the candidates already sourced for quick future
                hires.
                <br />
                <br />-{" "}
                <span className="bg-yellow-200 font-medium">
                  All this had to change and it really did with hire.win
                </span>
                ! The rate of closing hires has drastically improved and we are able to close many
                hires from the candidates we already sourced previosly and filed under Candidate
                Pools. Also, no more to and fro communication is required as all the task
                assignments, feedback collection and interview scheduling happens on one single
                platform!
              </p>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}
