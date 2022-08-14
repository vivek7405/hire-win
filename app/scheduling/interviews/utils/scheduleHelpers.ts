import { dateWithPartialTime, Schedule } from "app/scheduling/interviews/utils/scheduleToTakenSlots"
import { addDays, getDay, subDays } from "date-fns"

export function endOfLastWorkDayBefore(date: Date, schedule: Schedule, timezone: string): Date {
  console.log("Stepping inside while (true) of endOfLastWorkDayBefore")
  while (true) {
    date = subDays(date, 1)

    const weekday = getDay(date)

    if (schedule[weekday]) {
      const time = schedule[weekday]!.end

      console.log("Stepping out of while (true) of endOfLastWorkDayBefore")
      return dateWithPartialTime(date, time, timezone)
    }
  }
}

export function startOfFirstWorkDayOnOrAfter(
  date: Date,
  schedule: Schedule,
  timezone: string
): Date {
  console.log("Stepping inside while (true) of startOfFirstWorkDayOnOrAfter")
  while (true) {
    const weekday = getDay(date)

    if (schedule[weekday]) {
      const time = schedule[weekday]!.start

      console.log("Stepping out of while (true) of startOfFirstWorkDayOnOrAfter")
      return dateWithPartialTime(date, time, timezone)
    }

    date = addDays(date, 1)
  }
}
