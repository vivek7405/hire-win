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
import getCandidate from "app/jobs/queries/getCandidate"
import getJob from "app/jobs/queries/getJob"
import getUser from "app/users/queries/getUser"
import { invalidateQuery, useMutation, useQuery, useRouter, useSession } from "blitz"
import { enUS } from "date-fns/locale"
import moment from "moment"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Skeleton from "react-loading-skeleton"
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

type ScheduleMeetingProps = {
  interviewDetail: InterviewDetailType
  candidateId: string
  workflowStageId: string
  setOpenScheduleInterviewModal: any
}
export default function ScheduleMeeting({
  interviewDetail,
  candidateId,
  workflowStageId,
  setOpenScheduleInterviewModal,
}: ScheduleMeetingProps) {
  //   const [meeting] = useQuery(getMeeting, { username: username, slug: meetingSlug })
  // const [interviewDetail] = useQuery(getInterviewDetail, { interviewDetailId })
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>()
  const [scheduleInterviewMutation] = useMutation(scheduleInterview)
  // const [email, setEmail] = useState("")
  const [notificationTime, setNotificationTime] = useState(30)
  const [modalVisible, setModalVisible] = useState(false)
  //   const user = useCurrentUser()
  const [hideOccupied, setHideOccupied] = useState(false)
  const [error, setError] = useState({ error: false, message: "" })
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const session = useSession()
  const [organizer] = useQuery(getUser, { where: { id: session?.userId! } })
  const [candidate] = useQuery(getCandidate, { where: { id: candidateId } })
  const [job] = useQuery(getJob, { where: { id: candidate?.jobId } })
  const [otherAttendees, setOtherAttendees] = useState([] as string[])

  const [slots] = useQuery(getTimeSlots, {
    interviewerId: interviewDetail?.interviewer?.id,
    scheduleId: interviewDetail?.defaultSchedule?.id,
    duration: interviewDetail?.duration,
    otherAttendees,
    startDateUTC: new Date(moment()?.startOf("month")?.format("YYYY-MM-DD")),
    endDateUTC: new Date(moment()?.endOf("month")?.format("YYYY-MM-DD")),
  })

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

  // useEffect(() => {
  //   invalidateQuery(getTimeSlots)
  // }, [hideOccupied])

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

  if ((interviewDetail?.interviewer?.calendars?.length || 0) === 0) {
    return (
      <h2 className="text-center p-10 bg-white">
        You cannot schedule an interview since the interviewer ({interviewDetail?.interviewer?.name}
        ) has no calendars connected.
      </h2>
    )
  }

  let currentDate = new Date()
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  //   if (meeting.endDateUTC < zonedTimeToUtc(currentDate, timezone)) {
  //     return <h2 className="text-center m-5">This meeting is in the past.</h2>
  //   }

  if (!slots) {
    return <h2 className="text-center m-5">There are no free slots available for this meeting.</h2>
  }

  if (!selectedDay) {
    return <Skeleton count={10} />
  }

  const onDateChange = (selectedDay: Date | null) => {
    setSelectedTimeSlot(undefined)
    if (selectedDay) {
      setSelectedDay(selectedDay)
    }
  }

  const onSubmit = async () => {
    if (!selectedTimeSlot || selectedTimeSlot.start < new Date()) {
      setMessage("Please select a time slot. The time slot must be in the future.")
      return
    }
    // const parseResult = InterviewInput.safeParse({
    //   email,
    //   notificationTime,
    // })

    // if (!parseResult.success) {
    //   setMessage(parseResult?.error?.errors[0]!.message)
    //   return
    // }

    try {
      await scheduleInterviewMutation({
        jobId: candidate?.jobId,
        workflowStageId,
        candidateId,
        startDate: selectedTimeSlot.start,
        otherAttendees,
      })
      setSuccess(true)
      setOpenScheduleInterviewModal(false)
      toast.success("Interview scheduled successfully")
      invalidateQuery(getCandidateInterviewsByStage)
    } catch (e) {
      setError({ error: true, message: e.message })
      toast.error("Something went wrong while scheduling interview")
    }
  }

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
        <Form
          noFormatting={true}
          onSubmit={async () => {
            return
          }}
        >
          <label>Add more attendees:</label>
          {/* <LabeledTextField
            placeholder="Enter comma seperated email addresses"
            name="email"
            onChange={(e) => {
              // setEmail(e.target.value)
            }}
          /> */}
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
          onDateChange={onDateChange}
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
            className="bg-theme-600 hover:bg-theme-700 p-2 rounded-lg text-white"
            onClick={() => onSubmit()}
          >
            Schedule
          </button>
        )}
        {/* <div>
          {selectedTimeSlot && (
            <Form
              noFormatting={true}
              onSubmit={async () => {
                return
              }}
            >
              <LabeledTextField
                placeholder="Email"
                name="email"
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              />
              <button
                className="mt-5 bg-theme-600 hover:bg-theme-700 p-2 rounded-lg text-white"
                onClick={() => onSubmit()}
              >
                Schedule
              </button>
            </Form>
          )}
        </div> */}
      </div>
      {/* <Modal
        show={modalVisible}
        onHide={() => {
          setError({ error: false, message: "" })
          setMessage("")
          setSuccess(false)
          setModalVisible(false)
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Finish your interview.</Modal.Title>
        </Modal.Header>
        {!error.error && !success && (
          <Modal.Body>
            {selectedTimeSlot && (
              <p>
                You are interview the slot {formatAs24HourClockString(selectedTimeSlot.start)}-
                {formatAs24HourClockString(selectedTimeSlot.end)}.
              </p>
            )}
            You will receive a confirmation mail to this adress
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                    setEmail(e.currentTarget.value)
                  }
                />
              </Form.Group>
              <Form.Group controlId="formNotificationTime">
                <Form.Label>
                  Select how many minutes before the appointment you want to be notified:
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="30min"
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                    setNotificationTime(Number(e.currentTarget.value))
                  }
                />
              </Form.Group>
              <Form.Text className="text-danger mb-4">{message}</Form.Text>
            </Form>
            <Button variant="primary" onClick={() => onSubmit()} id="submit">
              Submit!
            </Button>
          </Modal.Body>
        )}
        {error.error && (
          <Alert variant="danger">
            Something went wrong: {error.message} Please edit your data and try again.
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            The slot has been booked! You will receive a confirmation e-mail with all details. You
            can close this website now.
          </Alert>
        )}
      </Modal> */}
    </>
  )
}
