import { areDatesEqual } from "../utils/comparison"
import { formatAs24HourClockString } from "../utils/format"
import { TimeSlot } from "../types"

interface SingleTimeSlotProps {
  start: Date
  end: Date
  setSelectedTimeSlot(v: TimeSlot): void
  selectedTimeSlot?: TimeSlot
  timezone?: string
}

const SingleTimeSlot = (props: SingleTimeSlotProps) => {
  const { start, end, setSelectedTimeSlot, selectedTimeSlot } = props

  const isSelected = !!selectedTimeSlot?.start && areDatesEqual(selectedTimeSlot.start, start)

  return (
    <button
      className={`w-48 m-1 border-2 border-theme-400 rounded-lg px-10 py-1 hover:bg-theme-100 ${
        isSelected
          ? "bg-theme-500 hover:!bg-theme-500 hover:!cursor-default !border-theme-500 text-white"
          : ""
      }`}
      onClick={() => {
        setSelectedTimeSlot({ start, end })
      }}
    >
      {formatAs24HourClockString(start, props.timezone)}-
      {formatAs24HourClockString(end, props.timezone)}
    </button>
  )
}

export default SingleTimeSlot
