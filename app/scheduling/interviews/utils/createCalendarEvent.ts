import db, { Calendar, Candidate, Interview, InterviewDetail, User } from "db"
import * as ics from "ics"

function durationToIcsDurationObject(durationInMinutes: number): ics.DurationObject {
  return {
    hours: Math.floor(durationInMinutes / 60),
    minutes: durationInMinutes % 60,
  }
}

export async function createICalendarEvent(
  interview: Interview & {
    interviewDetail: Pick<InterviewDetail, "interviewerId" | "duration">
  } & { candidate: Pick<Candidate, "email"> }
) {
  const interviewer = await db.user.findFirst({
    where: { id: interview?.interviewDetail?.interviewerId },
  })

  const { error, value } = ics.createEvent({
    start: [
      interview.startDateUTC.getFullYear(),
      interview.startDateUTC.getMonth() + 1,
      interview.startDateUTC.getDate(),
      interview.startDateUTC.getHours(),
      interview.startDateUTC.getMinutes(),
    ],
    duration: durationToIcsDurationObject(interview?.interviewDetail.duration),
    title: `Interview with ${interview?.candidate?.email}`,
    description: `Interview with ${interview?.candidate?.email}`,
    location: "",
    organizer: { name: interviewer?.name, email: interviewer?.email },
    attendees: [
      {
        name: interviewer?.name,
        email: interviewer?.email,
        rsvp: true,
        partstat: "ACCEPTED",
        role: "REQ-PARTICIPANT",
      },
    ],
  })

  if (error) {
    throw error
  }

  return value!
}
