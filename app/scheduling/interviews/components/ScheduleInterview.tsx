import { TrashIcon } from "@heroicons/react/outline"
import { Calendar, Schedule, User } from "@prisma/client"
import Card from "app/core/components/Card"
import Form from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import LabeledSelectField from "app/core/components/LabeledSelectField"
import LabeledTextField from "app/core/components/LabeledTextField"
import Modal from "app/core/components/Modal"
import Debouncer from "app/core/utils/debouncer"
import { getAppOriginURL } from "app/core/utils/getAppOriginURL"
import getCandidate from "app/candidates/queries/getCandidate"
import getJob from "app/jobs/queries/getJob"
import getUser from "app/users/queries/getUser"
import { invalidateQuery, useMutation, useQuery, useRouter, useSession } from "blitz"
import { enUS } from "date-fns/locale"
import moment from "moment"
import { Suspense, useEffect, useState } from "react"
import toast from "react-hot-toast"

import { DatePickerCalendar } from "react-nice-dates"
import { InterviewDetailType } from "types"
import scheduleInterview from "../mutations/scheduleInterview"
import getCandidateInterviewsByStage from "../queries/getCandidateInterviewsByStage"
import getTimeSlots from "../queries/getTimeSlots"
import { TimeSlot } from "../types"
import { areDatesOnSameDay } from "../utils/comparison"
// import { InterviewInput } from "../validations"
import AvailableTimeSlotsSelection from "./AvailableTimeSlotsSelection"
import getStage from "app/stages/queries/getStage"

type ScheduleInterviewProps = {
  interviewer: User
  candidateId: string
  stageId: string
  setOpenScheduleInterviewModal: any
}
export default function ScheduleInterview({
  interviewer,
  candidateId,
  stageId,
  setOpenScheduleInterviewModal,
}: ScheduleInterviewProps) {
  //   const [meeting] = useQuery(getMeeting, { username: username, slug: meetingSlug })
  // const [interviewDetail] = useQuery(getInterviewDetail, { interviewDetailId })
  const session = useSession()
  const [organizer] = useQuery(getUser, { where: { id: session?.userId! } })
  const [candidate] = useQuery(getCandidate, { where: { id: candidateId } })
  // const [stage] = useQuery(getStage, { where: { id: stageId } })

  return (
    <>
      <div className="bg-white text-center p-10 w-full md:w-96 lg:w-96 space-y-5">
        <h3 className="font-semibold text-xl">Schedule Interview</h3>
        <div>
          {organizer?.id === interviewer?.id ? (
            <>
              <h5>
                Organizer & Interviewer:{" "}
                {organizer?.id === session?.userId ? "You" : organizer?.name}
              </h5>
            </>
          ) : (
            <>
              <h5>Organizer: {organizer?.id === session?.userId ? "You" : organizer?.name}</h5>
              <h5>
                Interviewer: {interviewer?.id === session?.userId ? "You" : interviewer?.name}
              </h5>
            </>
          )}
          <h5>Candidate: {candidate?.name}</h5>
        </div>
        <Suspense fallback={<p className="mt-8 font-semibold">Loading Schedule...</p>}>
          <PickAndSchedule
            // interviewDetail={interviewDetail}
            interviewer={interviewer}
            candidate={candidate}
            organizer={organizer}
            stageId={stageId}
            candidateId={candidateId}
            setOpenScheduleInterviewModal={setOpenScheduleInterviewModal}
          />
        </Suspense>
      </div>
    </>
  )
}

const PickAndSchedule = ({
  // interviewDetail,
  interviewer,
  candidate,
  organizer,
  stageId,
  candidateId,
  setOpenScheduleInterviewModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>()
  const [scheduleInterviewMutation] = useMutation(scheduleInterview)
  const [job] = useQuery(getJob, { where: { id: candidate?.jobId } })
  const [otherAttendees, setOtherAttendees] = useState([] as string[])
  const [stage] = useQuery(getStage, { where: { id: stageId || "0" } })

  const [slots] = useQuery(getTimeSlots, {
    interviewerId: interviewer?.id,
    scheduleId:
      stage?.stageUserScheduleCalendars?.find((sc) => sc.userId === interviewer?.id || "0")
        ?.schedule?.id || "0",
    duration: stage?.duration,
    otherAttendees,
    startDateUTC: new Date(moment(selectedDay)?.startOf("month")?.format("YYYY-MM-DD")),
    endDateUTC: new Date(moment(selectedDay)?.endOf("month")?.format("YYYY-MM-DD")),
  })

  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (selectedDay) {
      return
    }

    if (!slots) {
      return
    }

    const [firstSlot] = slots
    if (!firstSlot) {
      return
    }

    setSelectedDay(firstSlot.start)
  }, [slots, selectedDay])

  useEffect(() => {
    invalidateQuery(getTimeSlots)
    setSelectedTimeSlot(undefined)
  }, [otherAttendees])

  // if (!interviewDetail) {
  //   return (
  //     <h2 className="text-center p-10 bg-white">
  //       No interview details are available for scheduling an interview.
  //     </h2>
  //   )
  // }

  if ((organizer?.calendars?.length || 0) === 0) {
    return (
      <h2 className="text-center p-10 bg-white">
        You cannot schedule an interview since you, the organizer ({organizer?.name}) has no
        calendars connected.
      </h2>
    )
  }

  if ((interviewer?.calendars?.length || 0) === 0) {
    return (
      <h2 className="text-center p-10 bg-white">
        You cannot schedule an interview since the interviewer ({interviewer?.name}) has no
        calendars connected.
      </h2>
    )
  }

  // let currentDate = new Date()
  // let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  //   if (meeting.endDateUTC < zonedTimeToUtc(currentDate, timezone)) {
  //     return <h2 className="text-center m-5">This meeting is in the past.</h2>
  //   }

  if (!slots) {
    return <h2 className="text-center m-5">There are no free slots available for this meeting.</h2>
  }

  if (!selectedDay) {
    return <></>
  }

  const onDateChange = (selectedDay: Date | null) => {
    setSelectedTimeSlot(undefined)
    if (selectedDay) {
      setSelectedDay(selectedDay)
    }
  }

  const onScheduleClick = async () => {
    if (!selectedTimeSlot || selectedTimeSlot.start < new Date()) {
      toast.error("Please select a time slot. The time slot must be in the future.")
      return
    }

    setIsScheduling(true)
    try {
      await scheduleInterviewMutation({
        jobId: candidate?.jobId,
        stageId,
        candidateId,
        startDate: selectedTimeSlot.start,
        otherAttendees,
      })
      setOpenScheduleInterviewModal(false)
      toast.success("Interview scheduled successfully")
      invalidateQuery(getCandidateInterviewsByStage)
    } catch (error) {
      toast.error(`Something went wrong: ${error.message}`)
    }
    setIsScheduling(false)
  }

  return (
    <>
      <Form
        noFormatting={true}
        onSubmit={async () => {
          return
        }}
      >
        <label>Add more attendees:</label>
        <LabeledReactSelectField
          name="attendees"
          placeholder="Select members to invite"
          isMulti={true}
          options={job?.users
            ?.filter((m) => m.userId !== organizer?.id && m.userId !== interviewer?.id)
            ?.map((m) => {
              return { label: m.user.name, value: m.userId.toString() }
            })}
          onChange={(val) => {
            setOtherAttendees(val as any as string[])
          }}
        />
      </Form>
      <DatePickerCalendar
        date={selectedDay}
        month={selectedDay}
        onDateChange={onDateChange}
        onMonthChange={async (selectedDay) => {
          onDateChange(selectedDay)
          await invalidateQuery(getTimeSlots)
        }}
        locale={enUS}
        modifiers={{
          disabled: (date) => {
            const isDateAvailable = slots.some(
              (slot) => areDatesOnSameDay(slot.start, date) && slot.start > new Date()
            )
            return !isDateAvailable
          },
        }}
        modifiersClassNames={{ selected: "-selected" }}
      />
      <AvailableTimeSlotsSelection
        slots={slots}
        selectedDay={selectedDay}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
      />
      {selectedTimeSlot && (
        <button
          className="bg-theme-600 hover:bg-theme-700 p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isScheduling}
          onClick={() => onScheduleClick()}
        >
          {isScheduling ? "Scheduling..." : "Schedule"}
        </button>
      )}
    </>
  )
}
