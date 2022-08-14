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
  console.log("Now inside applySchedule...")
  const specificSchedule = schedule[getDay(date)]

  console.log("Specific schedule:")
  console.log(specificSchedule)
  if (!specificSchedule) {
    if (type === "end") {
      console.log("Finding endOfLastWorkDayBefore...")

      const endOfLastWorkingDay = endOfLastWorkDayBefore(date, schedule, timezone)

      console.log("Returning from endOfLastWorkDayBefore:")
      console.log(endOfLastWorkingDay)

      return endOfLastWorkingDay
    } else {
      console.log("Finding startOfFirstWorkDayOnOrAfter...")

      const startOfFirstWorkDay = startOfFirstWorkDayOnOrAfter(date, schedule, timezone)

      console.log("Returning from startOfFirstWorkDayOnOrAfter:")
      console.log(startOfFirstWorkDay)

      return startOfFirstWorkDay
    }
  }

  let newDate = setHours(date, specificSchedule[type].hour)
  newDate = setMinutes(newDate, specificSchedule[type].minute)

  console.log("Returning from applySchedule:")
  console.log("newDate:")
  console.log(newDate)

  return newDate
}

async function getTakenSlots(
  calendars: Calendar[],
  startDateUTC: Date,
  endDateUTC: Date
): Promise<ExternalEvent[]> {
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

    console.log("startDateUTC:")
    console.log(startDateUTC)

    console.log("timezone:")
    console.log(interviewerSchedule?.timezone || "")

    console.log("utcToZonedTime:")
    console.log(utcToZonedTime(startDateUTC, interviewerSchedule?.timezone || ""))

    console.log("schedule:")
    console.log(schedule)

    console.log("Finding between...")
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
    console.log("between found:")
    console.log(between)

    console.log("takenTimeSlots:")
    console.log(takenTimeSlots)
    console.log("Entering computeAvailableSlots...")
    const availableSlots = computeAvailableSlots({
      between,
      durationInMilliseconds: (duration || 30) * 60 * 1000,
      takenSlots: [
        ...takenTimeSlots,
        ...scheduleToTakenSlots(schedule!, between, interviewerSchedule?.timezone || ""),
      ],
    })
    console.log("Leaving computeAvailableSlots. Available slots:")
    console.log(availableSlots)

    return availableSlots
  }
)
