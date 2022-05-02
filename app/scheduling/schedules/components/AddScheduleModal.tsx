import { ScheduleInput } from "../validations"
// import { SearchableDropdown } from "app/components/SearchableDropdown"
import getScheduleNames from "app/scheduling/schedules/queries/getScheduleNames"
import getSchedules from "app/scheduling/schedules/queries/getSchedules"
import { invalidateQuery, useMutation } from "blitz"
import React, { useState } from "react"
// import { Alert, Button, Col, Form, Modal } from "react-bootstrap"
import addSchedule from "../mutations/addSchedule"
import timezones from "../timezones"
import { mapValues } from "app/core/utils/map-values"
import Modal from "app/core/components/Modal"
import AddScheduleForm from "./AddScheduleForm"
import LabeledTextField from "app/core/components/LabeledTextField"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import Form from "app/core/components/Form"
import CheckboxField from "app/core/components/CheckboxField"
import getSchedulesWOPagination from "../queries/getSchedulesWOPagination"
import { initialSchedule } from "app/scheduling/constants"

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
type Schedules = Record<typeof days[number], { start: string; end: string }>

export const isScheduleWellFormed = (schedules: Schedules) => {
  return Object.values(schedules).every(({ start, end }) => isBefore(start, end))
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

const AddSchedule = () => {
  const [createScheduleMutation] = useMutation(addSchedule)
  const [schedule, setSchedule] = useState(initialSchedule)
  const [name, setName] = useState("")
  const [error, setError] = useState({ error: false, message: "" })
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [message, setMessage] = useState("")

  const scheduleChanged = (value: any, day: string, type: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [type]: value },
    })
  }

  const nameChanged = (e: any) => {
    setName(e.currentTarget.value)
  }

  const closeModal = (): void => {
    setError({ error: false, message: "" })
    setName("")
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    setSchedule(initialSchedule)
    setOpenAddSchedule(false)
  }

  const submit = async () => {
    const parseResult = ScheduleInput.refine((data) => isScheduleWellFormed(data.schedule), {
      message: "Please check the entered times. Expected is a format of hour:minutes, e.g. 09:30",
    }).safeParse({
      name,
      schedule,
    })

    if (!parseResult?.success) {
      setMessage(parseResult?.error?.errors[0]?.message || "")
      return
    }

    try {
      await createScheduleMutation({
        name: name,
        timezone,
        schedule: mapValues(schedule, ({ blocked, start, end }) =>
          blocked ? { startTime: "00:00", endTime: "00:00" } : { startTime: start, endTime: end }
        ),
      })
      // await invalidateQuery(getSchedules)
      await invalidateQuery(getScheduleNames)
      await invalidateQuery(getSchedulesWOPagination)
      closeModal()
    } catch (error) {
      setError({ error: true, message: error })
    }
  }

  const [openAddSchedule, setOpenAddSchedule] = useState(false)

  return (
    <>
      <Modal header="Add a new Schedule" open={openAddSchedule} setOpen={setOpenAddSchedule}>
        {/* <AddScheduleForm
          header=""
          subHeader=""
          onSubmit={async (values) => {
            alert(JSON.stringify(values))
            // submit()
          }}          
        /> */}
        <Form
          submitText="Submit"
          // schema={AddSchedule}
          initialValues={{}}
          onSubmit={async (values) => {
            submit()
          }}
          testid="addScheduleForm"
          header="New Schedule"
          subHeader="Add a new Schedule"
        >
          <LabeledTextField
            type="text"
            name="name"
            label="Schedule Name"
            placeholder="e.g. Workdays"
            onChange={nameChanged}
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
                  label="Block all day"
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
      </Modal>
      <button
        onClick={(e) => {
          e.preventDefault()
          setOpenAddSchedule(true)
        }}
      >
        New Schedule
      </button>
    </>
    // <Modal show={props.show} onHide={() => closeModal()}>
    //   <Modal.Header closeButton>
    //     <Modal.Title>Add a new Schedule</Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    //     <Form>
    //       <Form.Group controlId="name">
    //         <Form.Label>Name</Form.Label>
    //         <Form.Control
    //           name="name"
    //           value={name}
    //           placeholder="e.g. Workdays"
    //           onChange={nameChanged}
    //         />
    //       </Form.Group>
    //       <p>
    //         Please specify when you are generally available. Your invitees cannot pick a time slot
    //         outside of the provided window.
    //       </p>
    //       <Form.Group>
    //         <SearchableDropdown
    //           description="Change time zone"
    //           options={timezones}
    //           onSelect={setTimezone}
    //           value={timezone}
    //         />
    //       </Form.Group>
    //       <Form.Group controlId="days">
    //         {days.map((day) => {
    //           return (
    //             <Form.Row key={day}>
    //               <Form.Group as={Col}>
    //                 <Form.Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Form.Label>
    //                 <Form.Check
    //                   checked={schedule[day].blocked}
    //                   type="checkbox"
    //                   label="Block all day"
    //                   onChange={(e: any): void => {
    //                     scheduleChanged(!schedule[day].blocked, day, "blocked")
    //                   }}
    //                 />
    //               </Form.Group>
    //               <Form.Group as={Col}>
    //                 <Form.Label>&nbsp;</Form.Label>
    //                 {!schedule[day].blocked && (
    //                   <Form.Control
    //                     value={schedule[day].start}
    //                     onChange={(e) => {
    //                       scheduleChanged(e.currentTarget.value, day, "start")
    //                     }}
    //                   />
    //                 )}
    //               </Form.Group>
    //               <Form.Group as={Col}>
    //                 <Form.Label>&nbsp;</Form.Label>
    //                 {!schedule[day].blocked && (
    //                   <Form.Control
    //                     value={schedule[day].end}
    //                     onChange={(e) => {
    //                       scheduleChanged(e.currentTarget.value, day, "end")
    //                     }}
    //                   />
    //                 )}
    //               </Form.Group>
    //             </Form.Row>
    //           )
    //         })}
    //       </Form.Group>
    //       {error.error && (
    //         <Alert variant="danger">Couldn't add the schedule: {error.message}</Alert>
    //       )}
    //     </Form>
    //     <Form.Text className="text-danger">{message}</Form.Text>
    //   </Modal.Body>
    //   <Modal.Footer>
    //     <Button variant="secondary" onClick={() => closeModal()}>
    //       Close
    //     </Button>
    //     <Button variant="primary" onClick={() => submit()}>
    //       Save Schedule
    //     </Button>
    //   </Modal.Footer>
    // </Modal>
  )
}

export default AddSchedule
