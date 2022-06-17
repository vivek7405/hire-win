import db, { Calendar, Candidate, Interview, InterviewDetail, User } from "db"
import * as ics from "ics"
import { InterviewDetailType } from "types"

function durationToIcsDurationObject(durationInMinutes: number): ics.DurationObject {
  return {
    hours: Math.floor(durationInMinutes / 60),
    minutes: durationInMinutes % 60,
  }
}

export async function createICalendarEvent(
  interview: Interview & { candidate: Pick<Candidate, "email" | "name"> },
  interviewDetail: InterviewDetailType,
  organizer: Pick<User, "email" | "name">,
  otherAttendees: Pick<User, "email" | "name">[]
) {
  const interviewer = await db.user.findFirst({
    where: { id: interviewDetail?.interviewer?.id },
  })

  const { error, value } = ics.createEvent({
    start: [
      interview.startDateUTC.getFullYear(),
      interview.startDateUTC.getMonth() + 1,
      interview.startDateUTC.getDate(),
      interview.startDateUTC.getHours(),
      interview.startDateUTC.getMinutes(),
    ],
    duration: durationToIcsDurationObject(interviewDetail.duration),
    title: `Interview with ${interview?.candidate?.name}`,
    description: `Interview with ${interview?.candidate?.name}`,
    location: "",
    organizer: { name: organizer?.name, email: organizer?.email },
    attendees: [
      {
        name: interviewer?.name,
        email: interviewer?.email,
        rsvp: true,
        partstat: "ACCEPTED",
        role: "REQ-PARTICIPANT",
      },
      {
        name: interview?.candidate?.name,
        email: interview?.candidate?.email,
        rsvp: true,
        partstat: "ACCEPTED",
        role: "REQ-PARTICIPANT",
      },
      ...otherAttendees.map((attendee) => {
        return {
          name: attendee.name,
          email: attendee.email,
          rsvp: true,
          partstat: "ACCEPTED" as ics.ParticipationStatus,
          role: "REQ-PARTICIPANT" as ics.ParticipationRole,
        }
      }),
    ],
  })

  if (error) {
    throw error
  }

  return value!
}
