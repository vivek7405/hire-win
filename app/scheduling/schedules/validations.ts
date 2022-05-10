import * as z from "zod"

const Schedule = z.object({
  blocked: z.boolean(),
  start: z.string(),
  end: z.string(),
})

const Schedules = z.object({
  monday: Schedule,
  tuesday: Schedule,
  wednesday: Schedule,
  thursday: Schedule,
  friday: Schedule,
  saturday: Schedule,
  sunday: Schedule,
})

export const ScheduleInput = z.object({
  name: z.string().min(1, { message: "Please enter a name" }),
  schedule: Schedules,
})
export type ScheduleInputType = z.infer<typeof ScheduleInput>
