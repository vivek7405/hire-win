import Guard from "app/guard/ability"
import { getCalendarService } from "app/scheduling/calendars/calendar-service"
import { Ctx, invoke } from "blitz"
import db, { Interview, User } from "db"
import { sendInterviewCancellationMailer } from "mailers/sendInterviewCancellationMailer"
import getCalendar from "../queries/getCalendar"
import getScheduleCalendar from "../queries/getScheduleCalendar"
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

type CancelInterviewInput = {
  interviewId: string
  cancelCode: string
  skipCancelCodeVerification?: boolean
}
const cancelInterview = async (
  { interviewId, cancelCode, skipCancelCodeVerification }: CancelInterviewInput,
  ctx: Ctx
) => {
  const cancelCodeValid = await verifyCancelCode({ interviewId, cancelCode })
  if (!skipCancelCodeVerification && !cancelCodeValid) {
    throw Error("Invalid Cancellation code")
  }

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      interviewer: true,
      job: true,
      organizer: { include: { defaultCalendars: true } },
      candidate: true,
    },
  })

  if (!interview?.organizer) {
    throw new Error("Organizer doesn't exist for this interview")
  }

  const organizerCalendar = await db.calendar.findUnique({
    where: { id: interview.calendarId },
  })

  if (!organizerCalendar) {
    throw new Error("An error occured: Organizer doesn't have a connected calendar")
  }

  const calendarService = await getCalendarService(organizerCalendar)
  await calendarService.cancelEvent(interview.eventId)

  await db.interview.update({
    where: { id: interviewId },
    data: {
      cancelled: true,
    },
  })

  const buildEmail = await sendInterviewCancellationMailer({ interview })
  await buildEmail.send()
}

export default Guard.authorize("cancelInterview", "interview", cancelInterview)
