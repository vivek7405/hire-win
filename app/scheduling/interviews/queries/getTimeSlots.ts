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
      interviewDetailId: z.string(),
      hideInviteeSlots: z.boolean(),
      startDateUTC: z.date(),
      endDateUTC: z.date(),
    })
  ),
  async ({ interviewDetailId, hideInviteeSlots, startDateUTC, endDateUTC }, ctx: Ctx) => {
    // const meeting = await db.meeting.findFirst({
    //   where: { link: meetingSlug, ownerName: ownerName },
    //   include: { schedule: { include: { dailySchedules: true } } },
    // })
    // if (!meeting) return null

    // const meetingOwner = await db.user.findFirst({
    //   where: { username: ownerName },
    // })

    // if (!meetingOwner) return null

    const interviewDetail = await db.interviewDetail.findFirst({
      where: { id: interviewDetailId },
      include: {
        interviewer: { include: { calendars: true, schedules: true } },
        schedule: { include: { dailySchedules: true } },
      },
    })

    const schedule = interviewDetail?.schedule.dailySchedules.reduce(
      (res: Schedule, item: DailySchedule) => {
        res[Days[item.day]] = {
          start: timeStringToPartialTime(item.startTime),
          end: timeStringToPartialTime(item.endTime),
        }
        return res
      },
      {}
    )

    const calendars = interviewDetail?.interviewer?.calendars || []
    if (calendars.length === 0) return null

    let takenTimeSlots = await getTakenSlots(calendars, startDateUTC, endDateUTC)

    // if (hideInviteeSlots) {
    //   // ctx.session.$authorize()
    //   // const invitee = await db.user.findFirst({
    //   //   where: { id: ctx.session.userId },
    //   //   include: { calendars: true },
    //   // })
    //   // if (!invitee) {
    //   //   throw new Error("Current user invalid. Try logging in again")
    //   // }
    //   takenTimeSlots.push(...(await getTakenSlots(interviewDetail?.interviewer?.calendars || [], startDateUTC, endDateUTC)))
    // }

    const between = {
      start: applySchedule(
        utcToZonedTime(startDateUTC, interviewDetail?.schedule?.timezone || ""),
        schedule!,
        "start",
        interviewDetail?.schedule?.timezone || ""
      ),
      end: applySchedule(
        utcToZonedTime(endDateUTC, interviewDetail?.schedule?.timezone || ""),
        schedule!,
        "end",
        interviewDetail?.schedule?.timezone || ""
      ),
    }

    return computeAvailableSlots({
      between,
      durationInMilliseconds: (interviewDetail?.duration || 30) * 60 * 1000,
      takenSlots: [
        ...takenTimeSlots,
        ...scheduleToTakenSlots(schedule!, between, interviewDetail?.schedule?.timezone || ""),
      ],
    })
  }
)
