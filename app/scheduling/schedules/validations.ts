import * as z from "zod"

const Schedule = z.object({
  blocked: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
})

export const SchedulesObj = z.object({
  monday: Schedule,
  tuesday: Schedule,
  wednesday: Schedule,
  thursday: Schedule,
  friday: Schedule,
  saturday: Schedule,
  sunday: Schedule,
})

export const ScheduleInput = z.object({
  id: z.number().optional(),
  name: z.string().nonempty({ message: "Required" }),
  timezone: z.string().optional(),
  schedule: SchedulesObj,
  factory: z.boolean().optional(),
})
export type ScheduleInputType = z.infer<typeof ScheduleInput>

export const scheduleDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const
// type Schedules = Record<typeof scheduleDays[number], { startTime: string; endTime: string }>

export const isScheduleWellFormed = (schedules: z.infer<typeof SchedulesObj>) => {
  return Object.values(schedules).every(({ startTime, endTime }) => isBefore(startTime, endTime))
}

export const isBefore = (startTime: string, endTime: string) => {
  const start = parseTime(startTime)
  const end = parseTime(endTime)

  if (!start || !end) {
    return false
  }

  if (start[0] === end[0]) {
    // handle explicitly blocked dates ("00:00 - 00:00")
    if (start[0] === 0) {
      return start[1] === 0 && end[1] === 0
    }
    return start[1] < end[1]
  }

  return start[0] < end[0]
}

export const parseTime = (time: string): [start: number, end: number] | null => {
  const parts = time.split(":")
  if (parts.length !== 2) {
    return null
  }

  const [hours, minutes] = parts.map((v) => parseInt(v))

  if (hours && minutes) {
    if (hours < 0 || hours > 23) {
      return null
    }

    if (minutes < 0 || minutes > 59) {
      return null
    }

    return [hours, minutes]
  } else {
    return [0, 0]
  }
}
