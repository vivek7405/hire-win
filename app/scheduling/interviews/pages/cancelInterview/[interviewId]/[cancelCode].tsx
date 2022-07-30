import cancelInterview from "app/scheduling/interviews/mutations/cancelInterview"
import verifyCancelCode from "app/scheduling/interviews/queries/verifyCancelCode"
import {
  BlitzPage,
  ErrorComponent,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  useMutation,
  useParam,
  useQuery,
} from "blitz"
import React, { Suspense, useState } from "react"
import path from "path"

// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
//   // https://github.com/blitz-js/blitz/issues/794
//   path.resolve("next.config.js")
//   path.resolve("blitz.config.js")
//   path.resolve(".next/__db.js")
//   // End anti-tree-shaking

//   try {
//     const interviewId = context?.params?.interviewId as string
//     const cancelCode = context?.params?.cancelCode as string

//     if (interviewId && cancelCode) {
//       return {
//         props: {
//           interviewId,
//           cancelCode,
//         },
//       }
//     } else {
//       return { props: { error: { statusCode: 400, message: "Invalid request" } } }
//     }
//   } catch (error) {
//     return { props: { error: { statusCode: error.statusCode, message: error.message } } }
//   }
// }

const CancelInterview = ({ interviewId, cancelCode }) => {
  const [isCodeValid] = useQuery(verifyCancelCode, {
    interviewId: interviewId || "0",
    cancelCode: cancelCode || "0",
  })
  const [cancelInterviewMutation] = useMutation(cancelInterview)
  const [finished, setFinished] = useState(false)
  const [cancelling, setCancelling] = useState(false)

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
              setCancelling(true)
              await cancelInterviewMutation({
                interviewId: interviewId || "0",
                cancelCode: cancelCode || "0",
              })
              setCancelling(false)
              setFinished(true)
            }}
            className="text-white bg-red-500 px-4 py-2 rounded-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel booking"}
          </button>
        </div>
      )
    } else {
      return <h4 className="text-lg p-14">Sorry, the link you entered is invalid</h4>
    }
  }
}

const CancelBooking: BlitzPage = () => {
  const interviewId = useParam("interviewId", "string")
  const cancelCode = useParam("cancelCode", "string")

  if (!interviewId || !cancelCode) {
    return <ErrorComponent statusCode={400} title="Invalid request" />
  }
  return (
    <Suspense fallback="Loading...">
      <CancelInterview interviewId={interviewId || "0"} cancelCode={cancelCode} />
    </Suspense>
  )
}

export default CancelBooking
