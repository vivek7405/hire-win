import { google, calendar_v3 } from "googleapis"
import { createAuthenticatedGoogleOauth } from "./helpers/GoogleClient"
import db, { Calendar } from "db"
import {
  CalendarService,
  CreatedCalendarEvent,
  CreateEventInterview,
} from "src/calendars/calendar-service"
import { addMinutes } from "date-fns"
import { boilDownTimeIntervals } from "../utils/boildown-intervals"
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"

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
    // How to book an event in a particular calendar?
    // const calendarList = await this.calendar.calendarList.list()
    // Specify calendarId instead of "primary" while creating event

    const startDate = interview.startDateUTC
    const endDate = addMinutes(interview.startDateUTC, interview.duration)

    const randomRequestId = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      length: 3,
      separator: "-",
    })

    const interviewer = await db.user.findFirst({
      where: { id: interview?.interviewer?.id },
    })

    const event = await this.calendar.events.insert({
      calendarId: "primary",
      sendNotifications: true,
      sendUpdates: "all",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Interview of ${interview?.candidate?.name} for ${interview?.job?.title}`,
        location: "",
        description: "This meeting was booked via hire.win",
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Etc/UTC",
        },
        end: {
          dateTime: endDate.toISOString(),
        },
        organizer: { email: interview?.organizer?.email, displayName: interview?.organizer?.name },
        attendees: [
          { email: interviewer?.email, displayName: interviewer?.name },
          { email: interview.candidate.email, displayName: interview.candidate.name },
          ...interview.otherAttendees?.map((attendee) => {
            return { email: attendee?.email, displayName: attendee?.name }
          }),
        ],
        reminders: {
          useDefault: true,
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
            requestId: randomRequestId,
          },
        },
      },
    })

    if (event) {
      return {
        id: event.data.id,
        calendarLink: event.data.htmlLink,
        meetingLink: event.data.hangoutLink,
      } as CreatedCalendarEvent
    } else {
      return null
    }
  }

  public async cancelEvent(eventId) {
    await this.calendar.events.delete({
      eventId,
      calendarId: "primary",
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
