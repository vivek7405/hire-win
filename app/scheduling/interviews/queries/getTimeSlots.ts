import { ExternalEvent, getCalendarService } from "app/scheduling/calendars/calendar-service"
import { endOfLastWorkDayBefore, startOfFirstWorkDayOnOrAfter } from "../utils/scheduleHelpers"
import { Ctx, resolver } from "blitz"
import { getDay, setHours, setMinutes } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import db, { Calendar, DailySchedule, InterviewDetail } from "db"
import { computeAvailableSlots } from "../utils/computeAvailableSlots"
import {
  Days,
  Schedule,
  scheduleToTakenSlots,
  timeStringToPartialTime,
} from "../utils/scheduleToTakenSlots"
import * as z from "zod"

function applySchedule(date: Date, schedule: Schedule, type: "start" | "end", timezone: string) {
  const specificSchedule = schedule[getDay(date)]
  if (!specificSchedule) {
    if (type === "end") {
      return endOfLastWorkDayBefore(date, schedule, timezone)
    } else {
      return startOfFirstWorkDayOnOrAfter(date, schedule, timezone)
    }
  }

  let newDate = setHours(date, specificSchedule[type].hour)
  newDate = setMinutes(newDate, specificSchedule[type].minute)
  return newDate
}

async function getTakenSlots(
  calendars: Calendar[],
  startDateUTC: Date,
  endDateUTC: Date
): Promise<ExternalEvent[]> {
  console.log("Getting taken time slots...")
  const result = await Promise.all(
    calendars.map(async (calendar) => {
      const calendarService = await getCalendarService(calendar)
      let calendarSlots
      try {
        calendarSlots = await calendarService.getTakenTimeSlots(startDateUTC, endDateUTC)
      } catch (e) {
        calendarSlots = []
      }
      return calendarSlots
    })
  )
  console.log("Got taken time slots:")
  console.log(result)

  const takenTimeSlots: ExternalEvent[] = []
  result.forEach((values) => {
    values.forEach((slots) => {
      takenTimeSlots.push(slots)
    })
  })
  return takenTimeSlots
}

export default resolver.pipe(
  resolver.zod(
    z.object({
      interviewerId: z.string()?.optional(),
      scheduleId: z.string()?.optional(),
      duration: z.number()?.optional(),
      otherAttendees: z.array(z.string()), // user ids - numbers as strings
      startDateUTC: z.date(),
      endDateUTC: z.date(),
    })
  ),
  async (
    { interviewerId, scheduleId, duration, otherAttendees, startDateUTC, endDateUTC },
    ctx: Ctx
  ) => {
    // const meeting = await db.meeting.findFirst({
    //   where: { link: meetingSlug, ownerName: ownerName },
    //   include: { schedule: { include: { dailySchedules: true } } },
    // })
    // if (!meeting) return null

    // const meetingOwner = await db.user.findFirst({
    //   where: { username: ownerName },
    // })

    // if (!meetingOwner) return null

    // const interviewDetail = await db.interviewDetail.findUnique({
    //   where: { id: interviewDetailId },
    //   include: {
    //     interviewer: { include: { calendars: true, schedules: true } },
    //     schedule: { include: { dailySchedules: true } },
    //   },
    // })

    const interviewer = await db.user.findFirst({
      where: { id: interviewerId },
      include: { calendars: true },
    })

    const organizer = await db.user.findFirst({
      where: { id: ctx.session.userId! },
      include: { calendars: true },
    })

    const interviewerSchedule = await db.schedule.findFirst({
      where: { id: scheduleId },
      include: { dailySchedules: true },
    })

    console.log("Getting schedule...")
    const schedule = interviewerSchedule?.dailySchedules.reduce(
      (res: Schedule, item: DailySchedule) => {
        res[Days[item.day]] = {
          start: timeStringToPartialTime(item.startTime),
          end: timeStringToPartialTime(item.endTime),
        }
        return res
      },
      {}
    )
    console.log("Got schedule:")
    console.log(schedule)

    const calendars = interviewer?.calendars || []
    if (calendars.length === 0) return null

    let takenTimeSlots = await getTakenSlots(calendars, startDateUTC, endDateUTC)

    if (organizer?.id !== interviewer?.id) {
      if (organizer?.calendars) {
        await takenTimeSlots.push(
          ...(await getTakenSlots(organizer?.calendars, startDateUTC, endDateUTC))
        )
      }
    }

    if (otherAttendees) {
      // ctx.session.$authorize()
      // const invitee = await db.user.findFirst({
      //   where: { id: ctx.session.userId },
      //   include: { calendars: true },
      // })
      // if (!invitee) {
      //   throw new Error("Current user invalid. Try logging in again")
      // }
      await Promise.all(
        otherAttendees?.map(async (userId) => {
          const attendee = await db.user.findFirst({
            where: { id: userId },
            include: { calendars: true },
          })
          if (!attendee) {
            throw new Error(`Attendee invalid.`)
          }
          if (attendee.calendars) {
            await takenTimeSlots.push(
              ...(await getTakenSlots(attendee.calendars, startDateUTC, endDateUTC))
            )
          }
        })
      )
    }

    console.log("Getting between...")
    const between = {
      start: applySchedule(
        utcToZonedTime(startDateUTC, interviewerSchedule?.timezone || ""),
        schedule!,
        "start",
        interviewerSchedule?.timezone || ""
      ),
      end: applySchedule(
        utcToZonedTime(endDateUTC, interviewerSchedule?.timezone || ""),
        schedule!,
        "end",
        interviewerSchedule?.timezone || ""
      ),
    }
    console.log("Got between:")
    console.log(between)

    console.log("Computing available slots...")
    const availableSlots = computeAvailableSlots({
      between,
      durationInMilliseconds: (duration || 30) * 60 * 1000,
      takenSlots: [
        ...takenTimeSlots,
        ...scheduleToTakenSlots(schedule!, between, interviewerSchedule?.timezone || ""),
      ],
    })
    console.log("Computed available slots...")

    return availableSlots
  }
)
