import { ExternalEvent } from "app/scheduling/calendars/calendar-service"
import { TimeSlot } from "../types"

function orderedByStart(a: TimeSlot, b: TimeSlot) {
  if (a.start > b.start) {
    return [b, a]
  }

  return [a, b]
}

function collides(a: TimeSlot, b: TimeSlot): boolean {
  const [first, second] = orderedByStart(a, b)
  return (first?.end || new Date()) > (second?.start || new Date())
}

interface ComputeAvailabilitySlotsArgs {
  between: TimeSlot
  durationInMilliseconds: number
  takenSlots: ExternalEvent[]
}

export function computeAvailableSlots({
  between,
  durationInMilliseconds,
  takenSlots,
}: ComputeAvailabilitySlotsArgs): TimeSlot[] {
  let cursor = between.start

  const result: TimeSlot[] = []

  const endOfSearch = new Date(+between.end - durationInMilliseconds)

  // while loop seems to go in infinite loop when -
  // the server is in US
  // schedule timezone is set to Asia/Kolkata
  // client is in India
  // Clicks on Schedule button

  // Adding console logs to detect the issue
  console.log("between:")
  console.log(between)

  console.log("cursor (between.start):")
  console.log(cursor)

  console.log("+between.end:")
  console.log(+between.end)

  console.log("durationInMilliseconds")
  console.log(durationInMilliseconds)

  console.log("endOfSearch (new Date(+between.end - durationInMilliseconds)):")
  console.log(endOfSearch)

  while (cursor <= endOfSearch) {
    const potentialSlot: TimeSlot = {
      start: cursor,
      end: new Date(+cursor + durationInMilliseconds),
    }

    const collidingSlot = takenSlots.find((slot) => collides(slot, potentialSlot))

    if (!collidingSlot) {
      result.push(potentialSlot)
      cursor = potentialSlot.end
    } else {
      cursor = collidingSlot.end
    }
  }
  return result
}
