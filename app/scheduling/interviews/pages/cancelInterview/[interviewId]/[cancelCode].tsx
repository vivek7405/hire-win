import cancelInterview from "app/scheduling/interviews/mutations/cancelInterview"
import verifyCancelCode from "app/scheduling/interviews/queries/verifyCancelCode"
import { BlitzPage, useMutation, useParam, useQuery } from "blitz"
import React, { Suspense, useState } from "react"

const CancelInterview = ({ interviewId, cancelCode }) => {
  const [isCodeValid] = useQuery(verifyCancelCode, { interviewId, cancelCode })
  const [cancelInterviewMutation] = useMutation(cancelInterview)
  const [finished, setFinished] = useState(false)

  if (finished) {
    return (
      <>
        <h4 className="text-lg p-14">Your booking was successfully cancelled.</h4>
      </>
    )
  } else {
    if (isCodeValid) {
      return (
        <div className="p-14">
          <h1 className="text-lg font-bold">Cancel Booking</h1>
          <br />
          <br />
          <h4 className="font-semibold">Are you sure you want to cancel your booking?</h4>
          <br />
          <button
            onClick={async () => {
              await cancelInterviewMutation({ interviewId, cancelCode })
              setFinished(true)
            }}
            className="text-white bg-red-500 px-4 py-2 rounded-sm hover:bg-red-600"
          >
            Cancel booking
          </button>
        </div>
      )
    } else {
      return <h4 className="text-lg p-14">Sorry, the link you entered is invalid</h4>
    }
  }
}

const CancelBooking: BlitzPage = () => {
  const interviewId = useParam("interviewId", "number")
  const cancelCode = useParam("cancelCode", "string")

  if (!interviewId || !cancelCode) {
    return <></>
  }
  return (
    <Suspense fallback="Loading...">
      <CancelInterview interviewId={interviewId} cancelCode={cancelCode} />
    </Suspense>
  )
}

export default CancelBooking
