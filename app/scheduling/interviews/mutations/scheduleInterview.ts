import { NotFoundError, resolver, invoke, Ctx, invalidateQuery } from "blitz"
import db from "db"
import { addMinutes, subMinutes } from "date-fns"
import reminderQueue from "../api/queues/reminders"
import * as z from "zod"
import { getCalendarService } from "app/scheduling/calendars/calendar-service"
// import { getEmailService } from "../../email"
import { createICalendarEvent } from "../utils/createCalendarEvent"
import * as uuid from "uuid"
import getCalendar from "../queries/getCalendar"
import { sendInterviewConfirmation } from "mailers/sendInterviewConfirmation"
const bcrypt = require("bcrypt")

// async function sendConfirmationMail(
//   interview: Interview,
//   cancelLink: String,
//   meeting: Interview & { owner: User }
// ) {
//   const startMonth = (interview.startDateUTC.getMonth() + 1).toString()
//   await getEmailService().send({
//     template: "confirmation",
//     message: {
//       to: interview.inviteeEmail,
//       attachments: [
//         {
//           filename: "appointment.ics",
//           content: createICalendarEvent(interview, meeting),
//         },
//       ],
//     },
//     locals: {
//       appointment: {
//         durationInMilliseconds: meeting.duration * 60 * 1000,
//         title: meeting.name,
//         description: meeting.description ?? "Description",
//         location: meeting.location,
//         url: "www.kalle.app",
//         organiser: {
//           name: meeting.ownerName,
//           email: meeting.owner.email,
//         },
//         owner: {
//           name: interview.inviteeEmail.split("@")[0],
//           email: interview.inviteeEmail,
//         },
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
//         cancelLink: cancelLink,
//       },
//     },
//   })
// }

export default resolver.pipe(
  resolver.zod(
    z.object({
      interviewDetailId: z.string(),
      candidateId: z.string(),
      startDate: z.date(),
      moreAttendees: z.array(z.string()),
    })
  ),
  async (interviewInfo, ctx: Ctx) => {
    const interviewDetail = await db.interviewDetail.findUnique({
      where: { id: interviewInfo.interviewDetailId },
      include: { interviewer: { include: { calendars: true, defaultCalendars: true } } },
    })
    const candidate = await db.candidate.findUnique({
      where: { id: interviewInfo.candidateId },
      select: { id: true, email: true, name: true },
    })
    const organizer = await db.user.findUnique({
      where: { id: ctx.session.userId || 0 },
      select: { email: true, name: true },
    })
    const moreAttendees = await db.user.findMany({
      where: { id: { in: interviewInfo.moreAttendees?.map((userId) => parseInt(userId)) } },
      select: { email: true },
    })

    if (!interviewDetail || !candidate || !organizer) {
      throw new NotFoundError()
    }

    const defaultCalendarId = interviewDetail?.interviewer?.defaultCalendars?.find(
      (cal) => cal.userId === interviewDetail?.interviewer?.id
    )?.calendarId
    const interviewerCalendar = await invoke(
      getCalendar,
      interviewDetail.calendarId || defaultCalendarId || 0
    )
    if (!interviewerCalendar) {
      throw new Error("An error occured: Interviewer doesn't have a connected calendar")
    }

    const cancelCode = uuid.v4()

    const hashedCode = await bcrypt.hash(cancelCode, 10)
    const interview = await db.interview.create({
      data: {
        interviewDetail: {
          connect: { id: interviewDetail.id },
        },
        candidate: { connect: { id: candidate.id } },
        moreAttendees: moreAttendees?.map((attendee) => attendee.email)?.toString(),
        startDateUTC: interviewInfo.startDate,
        cancelCode: hashedCode,
      },
      include: { interviewDetail: { include: { interviewer: true } }, candidate: true },
    })

    const calendarService = await getCalendarService(interviewerCalendar)
    await calendarService.createEvent({
      ...interview,
      interviewDetail,
      candidate,
      organizer,
      moreAttendees: interviewInfo.moreAttendees,
    })

    const interviewDetailFromDb = await db.interviewDetail.findUnique({
      where: { id: interviewInfo.interviewDetailId },
      include: { interviewer: true },
    })
    if (!interviewDetailFromDb) {
      throw new Error("Interview details not found")
    }

    const cancelLink =
      process.env.NEXT_PUBLIC_APP_URL + "/cancelInterview/" + interview.id + "/" + cancelCode
    await sendInterviewConfirmation({
      interview,
      organizer,
      moreAttendees: interviewInfo.moreAttendees,
      cancelLink,
    })
    const startTime = subMinutes(interviewInfo.startDate, 30)
    if (startTime > addMinutes(new Date(), 30)) {
      await reminderQueue.enqueue(interview.id, { runAt: startTime })
    }

    return interview
  }
)
