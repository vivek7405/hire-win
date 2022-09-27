import { areDatesOnSameDay } from "../utils/comparison"
import { TimeSlot } from "../types"
import timezones from "../../schedules/timezones"
import { useState } from "react"
// import { SearchableDropdown } from "app/components/SearchableDropdown"
import SingleTimeSlot from "./SingleTimeSlot"
import Form from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import moment from "moment"

interface AvailableSlotsProps {
  slots: TimeSlot[]
  selectedDay?: Date
  setSelectedTimeSlot(v: TimeSlot): void
  selectedTimeSlot?: TimeSlot
}

const AvailableTimeSlotsSelection = (props: AvailableSlotsProps) => {
  const [timeZone, setTimeZone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const { slots, selectedDay } = props
  const selectedSlots = selectedDay
    ? slots.filter(
        (slot) =>
          areDatesOnSameDay(slot.start, selectedDay) &&
          moment(slot.start).utc().toDate() > moment().utc().toDate()
      )
    : []

  return (
    <>
      {selectedSlots?.length > 0 && (
        <div className="text-center max-h-96 overflow-y-scroll">
          <select
            title="Change time zone"
            defaultValue={timeZone?.replace("Calcutta", "Kolkata")}
            onChange={(e) => {
              setTimeZone(e.target.value)
            }}
            className={`w-48 m-1 border-2 border-theme-400 rounded-lg px-10 py-1 hover:bg-theme-100 focus:ring-0`}
          >
            {timezones?.map((timezone) => {
              return (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              )
            })}
          </select>
          <ul>
            {selectedSlots.map((slot, index) => (
              <li key={index} className="w-full">
                <SingleTimeSlot
                  start={slot.start}
                  end={slot.end}
                  selectedTimeSlot={props.selectedTimeSlot}
                  setSelectedTimeSlot={props.setSelectedTimeSlot}
                  timezone={timeZone}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default AvailableTimeSlotsSelection
