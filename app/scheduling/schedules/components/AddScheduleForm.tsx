import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form } from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import timezones from "../timezones"
import CheckboxField from "app/core/components/CheckboxField"
import { useRef, useState } from "react"
import { initialSchedule } from "app/scheduling/constants"
import { scheduleDays, SchedulesObj } from "../validations"
import { z } from "zod"
// import { AddSchedule } from "app/categories/validations"

type AddScheduleFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  // isDefaultEdit?: boolean
}

export const AddScheduleForm = (props: AddScheduleFormProps) => {
  // const scheduleChanged = (value: any, day: string, type: string) => {
  //   setSchedule({
  //     ...schedule,
  //     [day]: { ...schedule[day], [type]: value },
  //   })
  // }

  // const days = [
  //   "monday",
  //   "tuesday",
  //   "wednesday",
  //   "thursday",
  //   "friday",
  //   "saturday",
  //   "sunday",
  // ] as const

  const [schedule, setSchedule] = useState(props.initialValues || initialSchedule)
  const scheduleChanged = (value: any, day: string, type: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [type]: value },
    })
  }

  return (
    <>
      <Form
        submitText="Submit"
        schema={SchedulesObj.merge(
          z.object({
            name: z.string().nonempty({ message: "Required" }),
            timezone: z.string().optional(),
          })
        )}
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
          // disabled={props.isDefaultEdit || false}
          placeholder="e.g. Workdays"
        />
        <p>
          Please specify when you are generally available. Your invitees cannot pick a time slot
          outside of the provided window.
        </p>
        <LabeledReactSelectField
          name="timezone"
          placeholder="Change time zone"
          defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
          options={timezones.map((tz) => {
            return { label: tz, value: tz }
          })}
        />
        {scheduleDays.map((day) => {
          return (
            <div key={day}>
              <label className="font-medium capitalize">{day}</label>
              <CheckboxField
                name={`${day}.blocked`}
                type="checkbox"
                label="Not available"
                // checked={schedule[day]?.blocked}
                onChange={(checked) => {
                  scheduleChanged(checked, day, "blocked")
                }}
                defaultValue={schedule[day]?.blocked}
              />
              {!schedule[day]?.blocked && (
                <div className="w-full flex mt-2 space-x-2">
                  <div className="w-full">
                    <LabeledTextField
                      name={`${day}.startTime`}
                      // value={schedule[day].startTime}
                      // onChange={(e) => {
                      //   scheduleChanged(e.currentTarget.value, day, "startTime")
                      // }}
                    />
                  </div>
                  <div className="w-full">
                    <LabeledTextField
                      name={`${day}.endTime`}
                      // value={schedule[day].endTime}
                      // onChange={(e) => {
                      //   scheduleChanged(e.currentTarget.value, day, "endTime")
                      // }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </Form>
    </>
  )
}

export default AddScheduleForm
