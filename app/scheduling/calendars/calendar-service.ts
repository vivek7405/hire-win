import { Interview, Calendar, InterviewDetail, Prisma, User, Candidate, Job } from "db"
import { InterviewDetailType } from "types"
import { CaldavService } from "./caldav"
import { GoogleCalendarService } from "./googlecalendar/googlecalendar"
import { OutlookCalendarService } from "./outlookcalendar/outlookcalendar"

// export type CreateEventInterview = Pick<Interview, "startDateUTC"> & {
//   interviewDetail: InterviewDetailType
// } & { candidate: Pick<Candidate, "id" | "email" | "name"> } & {
//   organizer: Pick<User, "id" | "email" | "name">
// } & { otherAttendees: Pick<User, "id" | "email" | "name">[] } // userIds of attendees

export type CreateEventInterview = {
  organizer: Pick<User, "id" | "email" | "name">
} & {
  interviewer: Pick<User, "id" | "email" | "name">
} & {
  job: Pick<Job, "title">
} & {
  candidate: Pick<Candidate, "id" | "email" | "name">
} & { otherAttendees: Pick<User, "id" | "email" | "name">[] } & {
  startDateUTC: Date
} & { duration: number }

export interface ExternalEvent {
  title?: string
  start: Date
  end: Date
}

export type CreatedCalendarEvent = {
  id: string
  calendarLink: string
  meetingLink: string
}

export interface CalendarService {
  createEvent(interview: CreateEventInterview): Promise<CreatedCalendarEvent | null>
  cancelEvent(eventId: string): Promise<void>
  getTakenTimeSlots(start: Date, end: Date): Promise<ExternalEvent[]>
}

export async function getCalendarService(calendar: Calendar): Promise<CalendarService> {
  switch (calendar.type) {
    case "CaldavBasic":
    case "CaldavDigest":
      return await CaldavService.fromCalendar(calendar)
    case "GoogleCalendar":
      return new GoogleCalendarService(calendar)
    case "OutlookCalendar":
      return await OutlookCalendarService.getOutlookCalendarService(calendar)
    default:
      throw new Error("Unknown Calendar Type: " + calendar.type)
  }
}
