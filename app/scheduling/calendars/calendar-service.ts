import { Interview, Calendar, InterviewDetail, Prisma, User, Candidate } from "db"
import { CaldavService } from "./caldav"
import { GoogleCalendarService } from "./googlecalendar/googlecalendar"
import { OutlookCalendarService } from "./outlookcalendar/outlookcalendar"

export type CreateEventInterview = Pick<Interview, "startDateUTC"> & {
  interviewDetail: Pick<InterviewDetail, "duration" | "jobId" | "workflowStageId" | "interviewerId">
} & { candidate: Pick<Candidate, "email" | "name"> } & {
  organizer: Pick<User, "email" | "name">
} & { moreAttendees: string[] } // userIds of attendees

export interface ExternalEvent {
  title?: string
  start: Date
  end: Date
}

export interface CalendarService {
  createEvent(interview: CreateEventInterview): Promise<void>
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
