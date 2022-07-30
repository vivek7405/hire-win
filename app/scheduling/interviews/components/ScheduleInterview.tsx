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
import getInterviewDetail from "../queries/getInterviewDetail"
import getTimeSlots from "../queries/getTimeSlots"
import { TimeSlot } from "../types"
import { areDatesOnSameDay } from "../utils/comparison"
// import { InterviewInput } from "../validations"
import AvailableTimeSlotsSelection from "./AvailableTimeSlotsSelection"

type ScheduleInterviewProps = {
  interviewDetail: InterviewDetailType
  candidateId: string
  workflowStageId: string
  setOpenScheduleInterviewModal: any
}
export default function ScheduleInterview({
  interviewDetail,
  candidateId,
  workflowStageId,
  setOpenScheduleInterviewModal,
}: ScheduleInterviewProps) {
  //   const [meeting] = useQuery(getMeeting, { username: username, slug: meetingSlug })
  // const [interviewDetail] = useQuery(getInterviewDetail, { interviewDetailId })
  const session = useSession()
  const [organizer] = useQuery(getUser, { where: { id: session?.userId! } })
  const [candidate] = useQuery(getCandidate, { where: { id: candidateId } })

  return (
    <>
      <div className="bg-white text-center p-10 w-full md:w-96 lg:w-96 space-y-5">
        <h3 className="font-semibold text-xl">Schedule Interview</h3>
        <div>
          {organizer?.id === interviewDetail?.interviewer?.id ? (
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
                Interviewer:{" "}
                {interviewDetail?.interviewer?.id === session?.userId
                  ? "You"
                  : interviewDetail?.interviewer?.name}
              </h5>
            </>
          )}
          <h5>Candidate: {candidate?.name}</h5>
        </div>
        <Suspense fallback={<p className="mt-8 font-semibold">Loading Schedule...</p>}>
          <PickAndSchedule
            interviewDetail={interviewDetail}
            candidate={candidate}
            organizer={organizer}
            workflowStageId={workflowStageId}
            candidateId={candidateId}
            setOpenScheduleInterviewModal={setOpenScheduleInterviewModal}
          />
        </Suspense>
      </div>
    </>
  )
}

const PickAndSchedule = ({
  interviewDetail,
  candidate,
  organizer,
  workflowStageId,
  candidateId,
  setOpenScheduleInterviewModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>()
  const [scheduleInterviewMutation] = useMutation(scheduleInterview)
  const [job] = useQuery(getJob, { where: { id: candidate?.jobId } })
  const [otherAttendees, setOtherAttendees] = useState([] as string[])

  const [slots] = useQuery(getTimeSlots, {
    interviewerId: interviewDetail?.interviewer?.id,
    scheduleId: interviewDetail?.schedule?.id,
    duration: interviewDetail?.duration,
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

  if (!interviewDetail) {
    return (
      <h2 className="text-center p-10 bg-white">
        No interview details are available for scheduling an interview.
      </h2>
    )
  }

  if ((organizer?.calendars?.length || 0) === 0) {
    return (
      <h2 className="text-center p-10 bg-white">
        You cannot schedule an interview since you, the organizer ({organizer?.name}) has no
        calendars connected.
      </h2>
    )
  }

  if ((interviewDetail?.interviewer?.calendars?.length || 0) === 0) {
    return (
      <h2 className="text-center p-10 bg-white">
        You cannot schedule an interview since the interviewer ({interviewDetail?.interviewer?.name}
        ) has no calendars connected.
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
        workflowStageId,
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
            ?.filter(
              (m) => m.userId !== organizer?.id && m.userId !== interviewDetail?.interviewer?.id
            )
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
