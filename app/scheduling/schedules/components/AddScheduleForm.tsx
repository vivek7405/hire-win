import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import timezones from "../timezones"
import CheckboxField from "app/core/components/CheckboxField"
import { useState } from "react"
// import { AddSchedule } from "app/categories/validations"

type AddScheduleFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header: string
  subHeader: string
}

const initialSchedule = {
  monday: { blocked: false, start: "09:00", end: "17:00" },
  tuesday: { blocked: false, start: "09:00", end: "17:00" },
  wednesday: { blocked: false, start: "09:00", end: "17:00" },
  thursday: { blocked: false, start: "09:00", end: "17:00" },
  friday: { blocked: false, start: "09:00", end: "17:00" },
  saturday: { blocked: true, start: "09:00", end: "17:00" },
  sunday: { blocked: true, start: "09:00", end: "17:00" },
}

export const AddScheduleForm = (props: AddScheduleFormProps) => {
  const scheduleChanged = (value: any, day: string, type: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [type]: value },
    })
  }

  const [schedule, setSchedule] = useState(initialSchedule)
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const

  return (
    <>
      <Form
        submitText="Submit"
        // schema={AddSchedule}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        testid="addScheduleForm"
        header={props.header}
        subHeader={props.subHeader}
      >
        <LabeledTextField
          type="text"
          name="name"
          label="Schedule Name"
          placeholder="e.g. Workdays"
        />
        <p>
          Please specify when you are generally available. Your invitees cannot pick a time slot
          outside of the provided window.
        </p>
        <LabeledReactSelectField
          name="timezone"
          placeholder="Change time zone"
          options={timezones.map((tz) => {
            return { label: tz, value: tz }
          })}
        />
        {days.map((day) => {
          return (
            <div key={day}>
              <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
              <CheckboxField
                name="blockAllDay"
                checked={schedule[day].blocked}
                type="checkbox"
                label="Not available"
                onChange={(e: any): void => {
                  scheduleChanged(!schedule[day].blocked, day, "blocked")
                }}
              />
              <label>&nbsp;</label>
              {!schedule[day].blocked && (
                <LabeledTextField
                  name="startTime"
                  value={schedule[day].start}
                  onChange={(e) => {
                    scheduleChanged(e.currentTarget.value, day, "start")
                  }}
                />
              )}
              <label>&nbsp;</label>
              {!schedule[day].blocked && (
                <LabeledTextField
                  name="endTime"
                  value={schedule[day].end}
                  onChange={(e) => {
                    scheduleChanged(e.currentTarget.value, day, "end")
                  }}
                />
              )}
            </div>
          )
        })}
      </Form>
    </>
  )
}

export default AddScheduleForm
