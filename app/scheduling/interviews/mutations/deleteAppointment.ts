import db, { Interview, User } from "db"
import { sendInterviewCancellation } from "mailers/sendInterviewCancellation"
import verifyCancelCode from "../queries/verifyCancelCode"

// async function sendCancellationMail(interview: Interview, meeting: Interview & { owner: User }) {
//   const startMonth = (interview.startDateUTC.getMonth() + 1).toString()
//   await getEmailService().send({
//     template: "cancellation",
//     message: {
//       to: meeting.owner.email,
//     },
//     locals: {
//       appointment: {
//         durationInMilliseconds: meeting.duration * 60 * 1000,
//         title: meeting.name,
//         partner: meeting.ownerName,
//         start: {
//           hour: interview.startDateUTC.getHours(),
//           minute:
//             interview.startDateUTC.getMinutes() === 0 ? "00" : interview.startDateUTC.getMinutes(),
//           day: interview.startDateUTC.getDate(),
//           month: startMonth.length === 2 ? startMonth : "0" + startMonth,
//           year: interview.startDateUTC.getFullYear(),
//         },
//         duration: {
//           hours: Math.floor(meeting.duration / 60),
//           minutes: meeting.duration % 60,
//         },
//       },
//     },
//   })
// }

export default async function deleteAppointmentMutation({ interviewId, cancelCode }) {
  const cancelCodeValid = await verifyCancelCode({ interviewId, cancelCode })
  if (!cancelCodeValid) {
    throw Error("Invalid Cancellationcode given")
  }

  const interview = await db.interview.delete({
    where: { id: interviewId },
    include: { interviewDetail: { include: { interviewer: true } }, candidate: true },
  })

  // const interviewDetail = await db.interviewDetail.findFirst({
  //   where: { id: interview.interviewDetailId },
  //   include: { interviewer: true },
  // })

  if (!interview?.interviewDetail) {
    throw new Error("Interview details doesn't exist for this interview")
  }

  await sendInterviewCancellation({ interview })
}
