import { ExternalEvent, getCalendarService } from "app/scheduling/calendars/calendar-service"
import { endOfLastWorkDayBefore, startOfFirstWorkDayOnOrAfter } from "../utils/scheduleHelpers"
import { Ctx, resolver } from "blitz"
import { getDay, setHours, setMinutes } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import db, { Calendar, DailySchedule } from "db"
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

    const between = {
      start: applySchedule(
        utcToZonedTime(startDateUTC, interviewerSchedule?.timezone || "UTC"),
        schedule!,
        "start",
        interviewerSchedule?.timezone || "UTC"
      ),
      end: applySchedule(
        utcToZonedTime(endDateUTC, interviewerSchedule?.timezone || "UTC"),
        schedule!,
        "end",
        interviewerSchedule?.timezone || "UTC"
      ),
    }

    const availableSlots = computeAvailableSlots({
      between,
      durationInMilliseconds: (duration || 30) * 60 * 1000,
      takenSlots: [
        ...takenTimeSlots,
        ...scheduleToTakenSlots(schedule!, between, interviewerSchedule?.timezone || "UTC"),
      ],
    })

    return availableSlots
  }
)

// import { ExternalEvent, getCalendarService } from "app/scheduling/calendars/calendar-service"
// import { endOfLastWorkDayBefore, startOfFirstWorkDayOnOrAfter } from "../utils/scheduleHelpers"
// import { Ctx, resolver } from "blitz"
// import { getDay, setHours, setMinutes } from "date-fns"
// import { utcToZonedTime } from "date-fns-tz"
// import db, { Calendar, DailySchedule } from "db"
// import { computeAvailableSlots } from "../utils/computeAvailableSlots"
// import {
//   Days,
//   Schedule,
//   scheduleToTakenSlots,
//   timeStringToPartialTime,
// } from "../utils/scheduleToTakenSlots"
// import * as z from "zod"
// import moment from "moment-timezone"
// import { TimeSlot } from "app/scheduling/interviews/types"

// function applySchedule(date: Date, schedule: Schedule, type: "start" | "end", timezone: string) {
//   const specificSchedule = schedule[getDay(date)]
//   if (!specificSchedule) {
//     if (type === "end") {
//       return endOfLastWorkDayBefore(date, schedule, timezone)
//     } else {
//       return startOfFirstWorkDayOnOrAfter(date, schedule, timezone)
//     }
//   }

//   let newDate = setHours(date, specificSchedule[type].hour)
//   newDate = setMinutes(newDate, specificSchedule[type].minute)
//   return newDate
// }

// async function getTakenSlots(
//   calendars: Calendar[],
//   startDateUTC: Date,
//   endDateUTC: Date
// ): Promise<ExternalEvent[]> {
//   const result = await Promise.all(
//     calendars.map(async (calendar) => {
//       const calendarService = await getCalendarService(calendar)
//       let calendarSlots
//       try {
//         calendarSlots = await calendarService.getTakenTimeSlots(startDateUTC, endDateUTC)
//       } catch (e) {
//         calendarSlots = []
//       }
//       return calendarSlots
//     })
//   )
//   const takenTimeSlots: ExternalEvent[] = []
//   result.forEach((values) => {
//     values.forEach((slots) => {
//       takenTimeSlots.push(slots)
//     })
//   })
//   return takenTimeSlots
// }

// function getActualUTCDate(date, timezone) {
//   // const hours = date?.getHours()
//   // const formattedHours = ("0" + hours).slice(-2)

//   // const minutes = date?.getMinutes()
//   // const formattedMinutes = ("0" + minutes)?.slice(-2)

//   // const seconds = date?.getSeconds()
//   // const formattedSeconds = ("0" + seconds)?.slice(-2)

//   // const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`

//   const dateString = date?.toDateString()
//   const timeString = `${("0" + date?.getHours())?.slice(-2)}:${("0" + date?.getMinutes())?.slice(
//     -2
//   )}:${("0" + date?.getSeconds())?.slice(-2)}`

//   const utcOffset = moment(`${dateString} ${timeString}`)
//     .tz(timezone || "UTC")
//     .utcOffset()

//   const actualUTCDateString = moment(`${dateString} ${timeString}`)
//     .utcOffset(-utcOffset)
//     .format("YYYY-MM-DD HH:mm:ss")

//   return new Date(actualUTCDateString)
// }

// export default resolver.pipe(
//   resolver.zod(
//     z.object({
//       interviewerId: z.string()?.optional(),
//       scheduleId: z.string()?.optional(),
//       duration: z.number()?.optional(),
//       otherAttendees: z.array(z.string()), // user ids - numbers as strings
//       startDateUTC: z.date(),
//       endDateUTC: z.date(),
//     })
//   ),
//   async (
//     { interviewerId, scheduleId, duration, otherAttendees, startDateUTC, endDateUTC },
//     ctx: Ctx
//   ) => {
//     // const meeting = await db.meeting.findFirst({
//     //   where: { link: meetingSlug, ownerName: ownerName },
//     //   include: { schedule: { include: { dailySchedules: true } } },
//     // })
//     // if (!meeting) return null

//     // const meetingOwner = await db.user.findFirst({
//     //   where: { username: ownerName },
//     // })

//     // if (!meetingOwner) return null

//     // const interviewDetail = await db.interviewDetail.findUnique({
//     //   where: { id: interviewDetailId },
//     //   include: {
//     //     interviewer: { include: { calendars: true, schedules: true } },
//     //     schedule: { include: { dailySchedules: true } },
//     //   },
//     // })

//     const interviewer = await db.user.findFirst({
//       where: { id: interviewerId },
//       include: { calendars: true },
//     })

//     const organizer = await db.user.findFirst({
//       where: { id: ctx.session.userId! },
//       include: { calendars: true },
//     })

//     const interviewerSchedule = await db.schedule.findFirst({
//       where: { id: scheduleId },
//       include: { dailySchedules: true },
//     })

//     const schedule = interviewerSchedule?.dailySchedules.reduce(
//       (res: Schedule, item: DailySchedule) => {
//         res[Days[item.day]] = {
//           start: timeStringToPartialTime(item.startTime),
//           end: timeStringToPartialTime(item.endTime),
//         }
//         return res
//       },
//       {}
//     )

//     const calendars = interviewer?.calendars || []
//     if (calendars.length === 0) return null

//     let takenTimeSlots = await getTakenSlots(calendars, startDateUTC, endDateUTC)

//     if (organizer?.id !== interviewer?.id) {
//       if (organizer?.calendars) {
//         await takenTimeSlots.push(
//           ...(await getTakenSlots(organizer?.calendars, startDateUTC, endDateUTC))
//         )
//       }
//     }

//     if (otherAttendees) {
//       // ctx.session.$authorize()
//       // const invitee = await db.user.findFirst({
//       //   where: { id: ctx.session.userId },
//       //   include: { calendars: true },
//       // })
//       // if (!invitee) {
//       //   throw new Error("Current user invalid. Try logging in again")
//       // }
//       await Promise.all(
//         otherAttendees?.map(async (userId) => {
//           const attendee = await db.user.findFirst({
//             where: { id: userId },
//             include: { calendars: true },
//           })
//           if (!attendee) {
//             throw new Error(`Attendee invalid.`)
//           }
//           if (attendee.calendars) {
//             await takenTimeSlots.push(
//               ...(await getTakenSlots(attendee.calendars, startDateUTC, endDateUTC))
//             )
//           }
//         })
//       )
//     }

//     const between = {
//       start: applySchedule(utcToZonedTime(startDateUTC, "UTC"), schedule!, "start", "UTC"),
//       end: applySchedule(utcToZonedTime(endDateUTC, "UTC"), schedule!, "end", "UTC"),
//     }

//     // These available slots are actually in the schedule timezone but are returned in UTC
//     // We need to convert them to actual UTC datetime
//     const availableSlots = computeAvailableSlots({
//       between,
//       durationInMilliseconds: (duration || 30) * 60 * 1000,
//       takenSlots: [...takenTimeSlots, ...scheduleToTakenSlots(schedule!, between, "UTC")],
//     })

//     const availableSlotsUTC: TimeSlot[] = []

//     try {
//       availableSlots?.forEach((slot) => {
//         const slotStart = getActualUTCDate(slot.start, interviewerSchedule?.timezone)
//         const slotEnd = getActualUTCDate(slot.end, interviewerSchedule?.timezone)

//         availableSlotsUTC.push({
//           start: slotStart,
//           end: slotEnd,
//         })
//       })
//     } catch (error) {}

//     return availableSlotsUTC?.length > 0 ? availableSlotsUTC : availableSlots
//   }
// )
