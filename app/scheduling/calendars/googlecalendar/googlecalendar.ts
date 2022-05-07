import { google, calendar_v3 } from "googleapis"
import { createAuthenticatedGoogleOauth } from "./helpers/GoogleClient"
import db, { Calendar } from "db"
import { CalendarService, CreateEventInterview } from "app/scheduling/calendars/calendar-service"
import { addMinutes } from "date-fns"
import { boilDownTimeIntervals } from "../utils/boildown-intervals"

export class GoogleCalendarService implements CalendarService {
  private calendar: calendar_v3.Calendar

  constructor(calendar: Calendar) {
    if (!calendar.refreshToken) {
      throw new Error("refreshToken missing!")
    }

    this.calendar = google.calendar({
      version: "v3",
      auth: createAuthenticatedGoogleOauth(calendar.refreshToken),
    })
  }

  public async createEvent(interview: CreateEventInterview) {
    const startDate = interview.startDateUTC
    const endDate = addMinutes(interview.startDateUTC, interview.interviewDetail.duration)

    const interviewer = await db.user.findFirst({
      where: { id: interview?.interviewDetail.interviewerId },
    })

    await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Interview with ${interview.candidate.email}`,
        location: "",
        description: `Interview with ${interview.candidate.email}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Etc/UTC",
        },
        end: {
          dateTime: endDate.toISOString(),
        },
        attendees: [{ email: interviewer?.email }, { email: interview.candidate.email }],
        reminders: {
          useDefault: true,
        },
      },
    })
  }

  public async getTakenTimeSlots(start: Date, end: Date) {
    start.setHours(0, 0)
    end.setHours(23, 59)
    const {
      data: { items: ownedCalendars = [] },
    } = await this.calendar.calendarList.list({
      minAccessRole: "owner",
    })

    const {
      data: { calendars: calendarsWithFreeBusy },
    } = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: "UTC",
        groupExpansionMax: 100,
        calendarExpansionMax: 100,
        items: ownedCalendars.map((calendar) => ({ id: calendar.id! })),
      },
    })

    const rawFreeBusy = Object.values(calendarsWithFreeBusy ?? {})
      .flatMap((calendar) => calendar.busy ?? [])
      .map(({ start, end }) => ({ start: new Date(start!), end: new Date(end!) }))

    return boilDownTimeIntervals(rawFreeBusy)
  }
}
