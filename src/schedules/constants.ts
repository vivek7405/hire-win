import { z } from "zod"
import { SchedulesObj } from "./validations"

export const initialSchedule = {
  monday: { blocked: false, startTime: "09:00", endTime: "17:00" },
  tuesday: { blocked: false, startTime: "09:00", endTime: "17:00" },
  wednesday: { blocked: false, startTime: "09:00", endTime: "17:00" },
  thursday: { blocked: false, startTime: "09:00", endTime: "17:00" },
  friday: { blocked: false, startTime: "09:00", endTime: "17:00" },
  saturday: { blocked: true, startTime: "09:00", endTime: "17:00" },
  sunday: { blocked: true, startTime: "09:00", endTime: "17:00" },
} as z.infer<typeof SchedulesObj>
