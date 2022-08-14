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
  console.log("Now inside computeAvailableSlots...")

  let cursor = between.start

  const result: TimeSlot[] = []

  const endOfSearch = new Date(+between.end - durationInMilliseconds)

  console.log("Entering while (cursor <= endOfSearch)")
  console.log("cursor:")
  console.log(cursor)
  console.log("endOfSearch:")
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
  console.log("Left while (cursor <= endOfSearch)")

  console.log("Leaving computeAvailableSlots:")
  console.log(result)

  return result
}
