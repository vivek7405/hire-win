import {
  CalendarService,
  CreatedCalendarEvent,
  CreateEventInterview,
} from "src/calendars/calendar-service"
import {
  AuthorizationHeader,
  getAuthorizationHeader,
} from "src/calendars/outlookcalendar/helper/getAuthorizationHeader"
import { addMinutes } from "date-fns"
import db, { Calendar } from "db"
import { boilDownTimeIntervals } from "src/calendars/utils/boildown-intervals"
import makeRequestTo from "src/calendars/outlookcalendar/helper/callMicrosoftAPI"
import { zonedTimeToUtc } from "date-fns-tz"
import axios from "axios"

export class OutlookCalendarService implements CalendarService {
  private authorizationHeader: AuthorizationHeader
  private calendar: Calendar

  public static async getOutlookCalendarService(calendar: Calendar) {
    const outlookCalendarService = new OutlookCalendarService(calendar)
    await outlookCalendarService.initialize()
    return outlookCalendarService
  }

  private constructor(calendar: Calendar) {
    if (!calendar.refreshToken) {
      throw new Error("refreshToken missing!")
    }
    this.calendar = calendar
  }

  async initialize() {
    this.authorizationHeader = await getAuthorizationHeader(this.calendar.refreshToken!)
  }

  public async createEvent(interview: CreateEventInterview) {
    // How to book an event in a particular calendar?
    // https://learn.microsoft.com/en-us/graph/api/user-list-calendars?view=graph-rest-1.0&tabs=javascript
    // const options = {
    //   authProvider,
    // };
    // const client = Client.init(options);
    // let calendars = await client.api('/me/calendars')
    //   .get();
    // POST /me/calendars/{id}/events
    // Google has this.calendar.calendarList.list()

    const url = "https://graph.microsoft.com/v1.0/me/calendar/events"
    const startDate = interview.startDateUTC
    const endDate = addMinutes(interview.startDateUTC, interview.duration)

    const interviewer = await db.user.findFirst({
      where: { id: interview?.interviewer?.id },
    })

    const body = {
      Subject: `Interview of ${interview?.candidate?.name} for ${interview?.job?.title}`,
      Body: {
        ContentType: "HTML",
        Content: "This meeting was booked via hire.win",
      },
      Start: {
        DateTime: startDate,
        timeZone: "UTC",
      },
      End: {
        DateTime: endDate,
        timeZone: "UTC",
      },
      Organizer: {
        emailAddress: {
          name: interview.organizer.name,
          address: interview.organizer.email,
        },
      },
      Attendees: [
        {
          EmailAddress: {
            Address: interviewer?.email,
            Name: interviewer?.name,
          },
          Type: "Required",
        },
        {
          EmailAddress: {
            Address: interview.candidate.email,
            Name: interview.candidate.name,
          },
          Type: "Required",
        },
        ...interview.otherAttendees?.map((attendee) => {
          return {
            EmailAddress: {
              Address: attendee.email,
              Name: attendee.name,
            },
            Type: "Required",
          }
        }),
      ],
      isOnlineMeeting: true,
      // onlineMeetingProvider: "teamsForBusiness",
      onlineMeetingProvider: "skypeForConsumer",
    }

    const options = {
      method: "POST" as const,
      url: url,
      body: JSON.stringify(body),
      headers: { ...this.authorizationHeader, "content-type": "application/json" },
    }
    try {
      const event = await makeRequestTo(options)

      if (event) {
        return {
          id: event.id,
          calendarLink: event.webLink,
          meetingLink: event.onlineMeeting?.joinUrl,
        } as CreatedCalendarEvent
      } else {
        return null
      }
    } catch (err) {
      throw new Error("Error while requesting:" + err)
    }
  }

  public async cancelEvent(eventId) {
    const url = `https://graph.microsoft.com/v1.0/me/events/${eventId}/cancel`
    const options = {
      method: "POST" as const,
      url: url,
      body: JSON.stringify({}),
      headers: { ...this.authorizationHeader, "content-type": "application/json" },
    }
    try {
      await makeRequestTo(options)
      return
    } catch (err) {
      throw new Error("Error while requesting:" + err)
    }
  }

  public async getTakenTimeSlots(start: Date, end: Date) {
    start.setHours(0, 0)
    end.setHours(23, 59)
    const email = await this.getUsersEmailAddress()
    const url = "https://graph.microsoft.com/v1.0/me/calendar/getschedule"
    const body = {
      Schedules: [email],
      startTime: {
        dateTime: start.toUTCString(),
        timeZone: "UTC",
      },
      endTime: {
        dateTime: end.toUTCString(),
        timeZone: "UTC",
      },
    }

    var options = {
      method: "POST" as const,
      url: url,
      body: JSON.stringify(body),
      headers: { ...this.authorizationHeader, "content-type": "application/json" },
    }
    try {
      const rawScheduleData = await makeRequestTo(options)
      const schedule = rawScheduleData.value[0].scheduleItems
        .filter((event) => (event.status = "busy"))
        .map((event) => {
          return {
            start: zonedTimeToUtc(event.start.dateTime!, "UTC"),
            end: zonedTimeToUtc(event.end.dateTime!, "UTC"),
          }
        })

      return boilDownTimeIntervals(schedule)
    } catch (err) {
      throw new Error("Error while requesting:" + err)
    }
  }

  private async getUsersEmailAddress(): Promise<string> {
    const url = "https://graph.microsoft.com/beta/me/profile/emails"
    const headers = this.authorizationHeader

    const options = {
      headers,
      url: url,
      method: "GET" as const,
    }

    try {
      const res = await makeRequestTo(options)
      return res.value[0].address
    } catch (err) {
      throw new Error("Error while requesting:" + err)
    }
  }
}
