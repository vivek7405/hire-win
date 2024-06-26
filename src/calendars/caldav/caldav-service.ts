import * as urllib from "urllib"
import * as ical from "node-ical"
import _ from "lodash"
import { v4 as uuidv4 } from "uuid"
import type {
  CalendarService,
  CreateEventInterview,
  ExternalEvent,
} from "src/calendars/calendar-service"
import { Calendar } from "db"
import passwordEncryptor from "src/core/utils/password-encryptor"
import { addMinutes } from "date-fns"

function ensureProtocolIsSpecified(url: string) {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url
  }

  return "https://" + url
}

export interface CalendarConnectionDetails {
  url: string
  auth: {
    username: string
    password: string
    digest: boolean
  }
}

async function makeRequestTo(
  calendar: CalendarConnectionDetails,
  {
    data,
    method,
    headers,
    urlExtension = "",
  }: {
    method: string
    data: string
    headers: Record<string, string | number>
    urlExtension?: string
  }
) {
  const authString = `${calendar.auth.username}:${calendar.auth.password}`
  const res = await urllib.request<Buffer>(calendar.url + "/" + urlExtension, {
    ...(calendar.auth.digest ? { digestAuth: authString } : { auth: authString }),
    method: method as any,
    headers: headers as any,
    data,
  })
  return res
}

interface ConnectionDetailsVerificationFailure {
  fail: "unauthorized" | "other" | "wrong_url" | "wrong_protocol" | "no_caldav_support"
  error?: any
  connectionDetails: null
}

interface ConnectionVerificationSuccess {
  fail: null
  connectionDetails: CalendarConnectionDetails
}

/**
 * Tries to connect to the calendar.
 * If `auth.digest` is undefined, it will detect wihch auth method to use.
 * @example
 * const result = verifyConnectionDetails(...)
 * if (result.fail) {
 *    switch (result.failed) {
 *      case "unauthorized":
 *        ...
 *    }
 * } else {
 *    saveConnectionDetails(result.connectionDetails)
 * }
 */
export async function verifyConnectionDetails(
  url: string,
  username: string,
  password: string,
  dangerouslyAllowInsecureHttp = false
): Promise<ConnectionVerificationSuccess | ConnectionDetailsVerificationFailure> {
  try {
    url = ensureProtocolIsSpecified(url)

    const checkConnectionWith = async (
      method: "digest auth" | "basic auth"
    ): Promise<urllib.HttpClientResponse<unknown> | "unauthorized" | "no_caldav_support"> => {
      const response = await makeRequestTo(
        {
          url,
          auth: {
            username,
            password,
            digest: method === "digest auth",
          },
        },
        { method: "OPTIONS", data: "", headers: {} }
      )

      if (response.status >= 200 && response.status < 300) {
        return response
      } else if (response.status === 401) {
        return "unauthorized"
      } else {
        return "no_caldav_support"
      }
    }

    let digest = true
    let response = await checkConnectionWith("digest auth")
    if (
      response === "unauthorized" &&
      (dangerouslyAllowInsecureHttp || url.startsWith("https://"))
    ) {
      digest = false
      response = await checkConnectionWith("basic auth")
    }

    if (response === "no_caldav_support") {
      return { fail: "no_caldav_support", connectionDetails: null }
    }

    if (response === "unauthorized") {
      return { fail: "unauthorized", connectionDetails: null }
    }

    const supportedDavFeatures = (response.headers.dav ?? "")
      .toString()
      .split(",")
      .map((v) => v.trim())

    if (!supportedDavFeatures.includes("calendar-access")) {
      return { fail: "no_caldav_support", connectionDetails: null }
    }

    return {
      fail: null,
      connectionDetails: {
        url,
        auth: {
          username,
          password,
          digest,
        },
      },
    }
  } catch (error) {
    if (error.code === "ENOTFOUND") {
      return { fail: "wrong_url", connectionDetails: null }
    }

    if (error.code === "EPROTO") {
      return { fail: "wrong_protocol", connectionDetails: null }
    }

    return { fail: "other", error, connectionDetails: null }
  }
}

export function formatDateAsICS(date: Date) {
  return date.toISOString().replace(/-/g, "").replace(/:/g, "").split(".")[0] + "Z";
}

function isEvent(component: ical.CalendarComponent): component is ical.VEvent {
  return component.type === "VEVENT"
}

async function icsEventsToInternalEvents(ics: string): Promise<ExternalEvent[]> {
  const parsed = await ical.async.parseICS(ics)
  const icsEvents = Object.values(parsed).filter(isEvent)
  const internalEvents = icsEvents.flatMap((ev): ExternalEvent[] => {
    if (ev.transparency === "TRANSPARENT") {
      return []
    }
    return [
      {
        start: ev.start,
        end: ev.end,
        title: ev.summary,
      },
    ]
  })

  return _.sortBy(internalEvents, "start")
}

export async function getEvents(calendar: CalendarConnectionDetails, start: Date, end: Date) {
  const response = await makeRequestTo(calendar, {
    headers: {
      Depth: 1,
    },
    method: "REPORT",
    data: `
      <?xml version="1.0"?>
      <c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">

        <d:prop>
          <d:getetag />
          <c:calendar-data />
        </d:prop>

        <c:filter>
          <c:comp-filter name="VCALENDAR">
            <c:comp-filter name="VEVENT">
              <c:time-range
                start="${formatDateAsICS(start)}"
                end="${formatDateAsICS(end)}"
              />
            </c:comp-filter>
          </c:comp-filter>
        </c:filter>

      </c:calendar-query>`.trim(),
  })

  return await icsEventsToInternalEvents(response.data.toString())
}

interface VFreeBusy {
  type: "VFREEBUSY"
  params: any[]
  datetype: "date-time"
  start: ical.DateWithTimeZone
  end: ical.DateWithTimeZone
  dtstamp: ical.DateWithTimeZone
  freebusy?: {
    type: "FREE" | "BUSY" | "BUSY-TENTATIVE" | string
    start: ical.DateWithTimeZone
    end: ical.DateWithTimeZone
  }[]
}

function isFreeBusy(component: any): component is VFreeBusy {
  return (component.type as any) === "VFREEBUSY"
}

async function icsFreeBusyToInternalFreeBusy(ics: string): Promise<ExternalEvent[]> {
  const parsed = await ical.async.parseICS(ics)
  const icsFreeBusy = Object.values(parsed as any).filter(isFreeBusy)

  const internalFreeBusy = icsFreeBusy.flatMap(
    (v) =>
      v.freebusy?.flatMap((fb) => {
        if (fb.type === "FREE") {
          return []
        }
        return [
          {
            start: fb.start,
            end: fb.end,
          },
        ]
      }) ?? []
  )

  return _.sortBy(internalFreeBusy, "start")
}

export class CaldavService implements CalendarService {
  constructor(private readonly calendar: CalendarConnectionDetails) {}

  public static async fromCalendar(calendar: Calendar) {
    if (!calendar.encryptedPassword || !calendar.caldavAddress || !calendar.username) {
      throw new Error("Some credentials for your calendar are missing.")
    }

    const connectionDetails: CalendarConnectionDetails = {
      url: calendar.caldavAddress,
      auth: {
        username: calendar.username,
        password: await passwordEncryptor.decrypt(calendar.encryptedPassword),
        digest: calendar.type === "CaldavDigest",
      },
    }

    return new CaldavService(connectionDetails)
  }

  private makeRequest(opts: Parameters<typeof makeRequestTo>[1]) {
    return makeRequestTo(this.calendar, opts)
  }

  public async cancelEvent(eventId) {}

  // currently not working on baikal's default calender
  public async getTakenTimeSlots(start: Date, end: Date): Promise<ExternalEvent[]> {
    const response = await this.makeRequest({
      headers: {
        Depth: 1,
      },
      method: "REPORT",
      data: `
      <?xml version="1.0"?>
      <c:free-busy-query xmlns:c="urn:ietf:params:xml:ns:caldav">
        <c:time-range
          start="${formatDateAsICS(start)}"
          end="${formatDateAsICS(end)}"
        />
      </c:free-busy-query>`.trim(),
    })

    return await icsFreeBusyToInternalFreeBusy(response.data.toString())
  }

  public async createEvent(interview: CreateEventInterview) {
    const start = interview.startDateUTC
    const end = addMinutes(interview.startDateUTC, interview.duration)

    const dateNow = new Date()
    const uid = uuidv4()
    const data = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MailClient.VObject/8.0.3385.0
BEGIN:VEVENT
UID:${uid}
DTSTART;TZID=Europe/Berlin:${formatDateAsICS(start)}
DTEND;TZID=Europe/Berlin:${formatDateAsICS(end)}
TRANSP:OPAQUE
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
LAST-MODIFIED:${formatDateAsICS(dateNow)}
DTSTAMP:${formatDateAsICS(dateNow)}
CREATED:${formatDateAsICS(dateNow)}
LOCATION:${``}
SUMMARY:${`Interview of ${interview?.candidate?.name} for ${interview?.job?.title}`}
CLASS:PUBLIC
END:VEVENT
END:VCALENDAR\r\n`.trimLeft()
    const response = await makeRequestTo(this.calendar, {
      data: data,
      method: "PUT",
      urlExtension: uid + ".ics",
      headers: {
        Depth: 1,
      },
    })

    if (response.res.statusMessage !== "Created") {
      throw response.res
    }

    return null
  }
}
