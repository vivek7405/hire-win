import { resolver, invoke, invalidateQuery } from "@blitzjs/rpc"
import { Ctx, NotFoundError } from "blitz"
import db, { CandidateActivityType } from "db"
import { addMinutes, subMinutes } from "date-fns"
import * as z from "zod"
import { getCalendarService } from "src/calendars/calendar-service"
// import { getEmailService } from "../../email"
import { createICalendarEvent } from "../utils/createCalendarEvent"
import * as uuid from "uuid"
import getCalendar from "../queries/getCalendar"
import { sendInterviewConfirmationMailer } from "mailers/sendInterviewConfirmationMailer"
import moment from "moment"
import bcrypt from "bcrypt"
import { InterviewDetailType } from "types"
import getScheduleCalendar from "../queries/getScheduleCalendar"
import getCandidateInterviewer from "src/candidates/queries/getCandidateInterviewer"

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
//         organizer: {
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
      // interviewDetailId: z.string(),
      jobId: z.string(),
      stageId: z.string(),
      candidateId: z.string(),
      startDate: z.date(),
      otherAttendees: z.array(z.string()),
    })
  ),
  async (props, ctx: Ctx) => {
    // const interviewDetail = await db.interviewDetail.findUnique({
    //   where: {
    //     jobId_workflowStageId: {
    //       jobId: interviewInfo.jobId,
    //       workflowStageId: interviewInfo.workflowStageId,
    //     },
    //   },
    //   include: { interviewer: { include: { calendars: true, defaultCalendars: true } } },
    // })

    // const interviewDetail = (await getCandidateInterviewDetail({
    //   workflowStageId: interviewInfo.workflowStageId,
    //   candidateId: interviewInfo.candidateId,
    //   jobId: interviewInfo.jobId,
    // })) as InterviewDetailType

    const candidate = await db.candidate.findUnique({
      where: { id: props.candidateId },
      select: { id: true, email: true, name: true },
    })
    const job = await db.job.findUnique({
      where: { id: props.jobId },
      select: { id: true, title: true },
    })
    const stage = await db.stage.findUnique({
      where: { id: props.stageId },
      select: { id: true, name: true, interviewer: true, duration: true },
    })
    const organizer = await db.user.findUnique({
      where: { id: ctx.session.userId || "0" },
      select: {
        id: true,
        email: true,
        name: true,
        calendars: true,
        defaultCalendars: true,
      },
    })
    const otherAttendees = await db.user.findMany({
      where: { id: { in: props.otherAttendees?.map((userId) => userId) } },
      select: { id: true, email: true, name: true },
    })

    const interviewer = await getCandidateInterviewer(
      { stageId: props.stageId, candidateId: props.candidateId },
      ctx
    )

    if (!candidate || !job || !stage || !organizer) {
      throw new NotFoundError()
    }

    // const interviewerCalendar = await invoke(getCalendar, interviewDetail.calendar?.id || "0")
    // if (!interviewerCalendar) {
    //   throw new Error("An error occured: Interviewer doesn't have a connected calendar")
    // }

    const scheduleCalendar = await getScheduleCalendar(
      {
        stageId: props.stageId || "0",
        userId: organizer.id,
      },
      ctx
    )

    const organizerDefaultCalendarId = organizer?.defaultCalendars?.find(
      (cal) => cal.userId === organizer?.id
    )?.calendarId

    const organizerCalendar = await invoke(
      getCalendar,
      scheduleCalendar?.calendarId || organizerDefaultCalendarId || "0"
    )

    if (!organizerCalendar) {
      throw new Error("An error occured: Organizer doesn't have a connected calendar")
    }

    const startDateUTC = moment(props.startDate).utc().toDate()

    const calendarService = await getCalendarService(organizerCalendar)
    const event = await calendarService.createEvent({
      organizer,
      interviewer,
      job,
      candidate,
      otherAttendees: otherAttendees,
      startDateUTC,
      duration: stage?.duration,
    })

    const cancelCode = uuid.v4()
    const hashedCode = await bcrypt.hash(cancelCode, 10)
    const interview = await db.interview.create({
      data: {
        // interviewDetail: {
        //   connect: { id: interviewDetail.id },
        // },
        candidate: { connect: { id: candidate.id } },
        job: { connect: { id: job.id } },
        stage: { connect: { id: stage?.id || "0" } },
        organizer: { connect: { id: organizer.id } },
        interviewer: { connect: { id: interviewer?.id } },
        otherAttendees: {
          connect: otherAttendees?.map((attendee) => {
            return { id: attendee.id }
          }),
        },
        startDateUTC,
        duration: stage?.duration,
        calendarId: organizerCalendar?.id,
        eventId: event?.id,
        calendarLink: event?.calendarLink,
        meetingLink: event?.meetingLink,
        cancelCode: hashedCode,
      },
      include: { candidate: true, job: true, organizer: true },
    })

    // const interviewDetailFromDb = await db.interviewDetail.findUnique({
    //   where: {
    //     jobId_workflowStageId: {
    //       jobId: interviewInfo.jobId,
    //       workflowStageId: interviewInfo.workflowStageId,
    //     },
    //   },
    //   include: { interviewer: true },
    // })
    // if (!interviewDetailFromDb) {
    //   throw new Error("Interview details not found")
    // }

    // const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancelInterview/${interview.id}/${cancelCode}`
    // const buildEmail = await sendInterviewConfirmationMailer({
    //   interview,
    //   interviewDetail,
    //   organizer,
    //   otherAttendees,
    //   cancelLink,
    // })
    // await buildEmail.send()

    await db.candidateActivity.create({
      data: {
        title: `Interview with ${
          organizer?.id === interviewer?.id ? "self" : interviewer?.name
        } scheduled by ${organizer?.name} for stage "${stage?.name}"`,
        type: CandidateActivityType.Interview_Scheduled,
        performedByUserId: ctx?.session?.userId || "0",
        candidateId: candidate?.id || "0",
      },
    })

    return interview
  }
)
