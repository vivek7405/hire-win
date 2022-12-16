import { Routes } from "@blitzjs/next"
import { XIcon } from "@heroicons/react/outline"
import { useEffect } from "react"

const InvalidCouponMessage = ({ userName, setInvalidCoupon }) => {
  useEffect(() => {
    try {
      window.history.replaceState(null, "", Routes.JobsHome().pathname)
    } catch (e) {}
  }, [])

  return (
    <div className="mb-5 w-full px-4 py-2 border rounded bg-red-50 border-red-400 text-neutral-700 flex items-center relative">
      <div className="flex items-center space-x-2 pr-7">
        <span>
          This is odd! The coupon you redeemed is an{" "}
          <span className="font-semibold">Invalid Coupon</span> 😕 Please{" "}
          <a
            className="text-indigo-600 hover:underline"
            href="javascript:void(Tawk_API.maximize())"
          >
            reach out to us
          </a>{" "}
          for any help.
        </span>
      </div>
      <button
        className="float-right text-neutral-600 hover:text-neutral-900 absolute right-2 top-2"
        onClick={() => {
          window.history.replaceState(null, "", Routes.JobsHome().pathname)
          setInvalidCoupon(false)
        }}
      >
        <XIcon className="w-6 h-6" />
      </button>
    </div>
  )
}

export default InvalidCouponMessage
