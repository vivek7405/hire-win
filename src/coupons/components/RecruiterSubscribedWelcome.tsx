import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { XIcon } from "@heroicons/react/outline"
import { useEffect } from "react"
import getFirstWordIfLessThan from "src/core/utils/getFirstWordIfLessThan"

const RecruiterSubscribedWelcome = ({ setRecruiterSubscribed, userName, userId }) => {
  useEffect(() => {
    try {
      window.history.replaceState(null, "", Routes.UserSettingsBillingPage().pathname)
    } catch (e) {}
  }, [])

  return (
    <div className="w-full relative">
      <button
        className="text-neutral-600 hover:text-neutral-900 absolute right-2 top-2"
        onClick={() => {
          setRecruiterSubscribed(false)
        }}
      >
        <XIcon className="w-7 h-7" />
      </button>
      <div className="bg-white rounded-lg h-fit border-2 border-theme-600 mb-5 p-5">
        <div className="font-bold text-2xl text-center">Your recruiter plan is now active 🥳</div>
        <div className="mt-5 grid gird-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
          <div className="flex flex-col items-center justify-center space-y-8 pr-0 pb-5 sm:pb-0 sm:pr-5">
            <div className="w-full text-center text-neutral-800 text-xl flex flex-col space-y-3">
              <span>Thank you, {getFirstWordIfLessThan(userName, 50)}!</span>
              <span>That was an awesome choice you just made!</span>
            </div>

            <div className="flex items-center justify-center space-x-3 text-8xl">
              <span>🚀</span>
              <span>🤩</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8 pl-0 pt-5 sm:pt-0 sm:pl-5">
            <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
              <span>
                Feel free to{" "}
                <a
                  className="text-indigo-600 hover:underline"
                  href="javascript:void(Tawk_API.maximize())"
                >
                  get in touch
                </a>{" "}
                if you need any help 😇
                {/* Please get in touch if there's anything:{" "}
                <a className="text-theme-600 hover:underline" href="mailto:support@hire.win">
                  support@hire.win
                </a> */}
              </span>
            </div>

            <div className="w-full text-center text-neutral-800 text-xl flex flex-col items-center justify-center">
              <span>Your feedback encourages us to add more awesome features!</span>
            </div>

            <a
              target="_blank"
              rel="external"
              href="https://www.producthunt.com/products/hire-win/reviews/new"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl text-center"
            >
              Leave us a feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterSubscribedWelcome
