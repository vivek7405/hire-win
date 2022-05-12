import { TrashIcon } from "@heroicons/react/outline"
import { Interview, InterviewDetail, Membership, User } from "@prisma/client"
import Confirm from "app/core/components/Confirm"
import Modal from "app/core/components/Modal"
import { invalidateQuery, useMutation, useQuery } from "blitz"
import moment from "moment"
import { useState } from "react"
import toast from "react-hot-toast"
import cancelInterview from "../mutations/cancelInterview"
import getCandidateInterviewsByStage from "../queries/getCandidateInterviewsByStage"
import ScheduleInterview from "./ScheduleInterview"

const Interviews = ({ user, selectedWorkflowStage, candidate }) => {
  const [openScheduleInterviewModal, setOpenScheduleInterviewModal] = useState(false)
  const [cancelInterviewMutation] = useMutation(cancelInterview)
  const [interviewToDelete, setInterviewToDelete] = useState(null as any as Interview)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [candidateStageInterviews] = useQuery(getCandidateInterviewsByStage, {
    candidateId: candidate?.id || "0",
    workflowStageId: selectedWorkflowStage?.id || "0",
  })

  return (
    <>
      <Modal
        header="Schedule Interview"
        open={openScheduleInterviewModal}
        setOpen={setOpenScheduleInterviewModal}
      >
        <ScheduleInterview
          interviewDetailId={
            selectedWorkflowStage?.interviewDetails?.find((int) => int.jobId === candidate?.jobId)
              ?.id || "0"
          }
          candidateId={candidate?.id || "0"}
          setOpenScheduleInterviewModal={setOpenScheduleInterviewModal}
        />
      </Modal>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Cancel Interview"
        onSuccess={async () => {
          const toastId = toast.loading("Cancelling interview")
          try {
            await cancelInterviewMutation({
              interviewId: interviewToDelete?.id || 0,
              cancelCode: interviewToDelete?.cancelCode,
              skipCancelCodeVerification: true,
            })
            toast.success("Interview cancelled", { id: toastId })
            setOpenConfirm(false)
            await invalidateQuery(getCandidateInterviewsByStage)
          } catch (error) {
            toast.error(`Interview cancellation failed - ${error.toString()}`, {
              id: toastId,
            })
          }
        }}
      >
        Are you sure you want to cancel the interview?
      </Confirm>

      <div className="m-6">
        <div className="flex items-center">
          <div className="font-bold text-lg w-full">Interviews</div>
          <button
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-end text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
            disabled={
              selectedWorkflowStage?.interviewDetails?.find(
                (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
              )?.interviewerId !== user?.id &&
              user?.memberships?.find((membership) => membership.jobId === candidate?.jobId)
                ?.role !== "OWNER" &&
              user?.memberships?.find((membership) => membership.jobId === candidate?.jobId)
                ?.role !== "ADMIN"
            }
            onClick={() => {
              setOpenScheduleInterviewModal(true)
            }}
          >
            Schedule
          </button>
        </div>
        <div className="w-full mt-3 flex flex-col space-y-3">
          {candidateStageInterviews?.length === 0 && <p>No interviews scheduled</p>}
          {candidateStageInterviews
            ?.filter((interview) => interview.startDateUTC >= new Date())
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Upcoming</span>}
                  <CandidateInterview
                    key={interview.id}
                    interview={interview}
                    user={user as any}
                    setOpenConfirm={setOpenConfirm}
                    setInterviewToDelete={setInterviewToDelete}
                  />
                </>
              )
            })}
          {candidateStageInterviews
            ?.filter((interview) => interview.startDateUTC < new Date())
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Past</span>}
                  <CandidateInterview
                    key={interview.id}
                    interview={interview}
                    user={user as any}
                    setOpenConfirm={setOpenConfirm}
                    setInterviewToDelete={setInterviewToDelete}
                  />
                </>
              )
            })}
        </div>
      </div>
    </>
  )
}

type CandidateInterviewProps = {
  interview: Interview & { organizer: User } & { interviewer: User } & {
    otherAttendees: User[]
  } & { interviewDetail: InterviewDetail }
  user: User & { memberships: Membership[] }
  setOpenConfirm: any
  setInterviewToDelete: any
}
const CandidateInterview = ({
  interview,
  user,
  setOpenConfirm,
  setInterviewToDelete,
}: CandidateInterviewProps) => {
  return (
    <div key={interview.id} className="w-full p-3 bg-neutral-50 border-2 rounded">
      <button
        className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={
          user?.id !== interview?.interviewerId &&
          user?.id !== interview?.organizerId &&
          user?.memberships?.find(
            (membership) => membership.jobId === interview?.interviewDetail?.jobId
          )?.role !== "OWNER"
        }
        onClick={() => {
          setOpenConfirm(true)
          setInterviewToDelete(interview)
        }}
      >
        <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
      </button>
      <b className="capitalize">{moment(interview.startDateUTC).local().fromNow()}</b>
      <br />
      {moment(interview.startDateUTC).toLocaleString()}
      <br />
      Duration: <span className="whitespace-nowrap">{interview.duration} mins</span>
      <br />
      {interview.organizerId === interview.interviewerId ? (
        <>
          Organizer & Interviewer:{" "}
          {interview?.organizer?.id === user?.id ? "You" : interview?.organizer?.name}
        </>
      ) : (
        <>
          Organizer: {interview?.organizer?.id === user?.id ? "You" : interview?.organizer?.name}
          <br />
          Interviewer:{" "}
          {interview?.interviewer?.id === user?.id ? "You" : interview?.interviewer?.name}
        </>
      )}
      <br />
      Other Attendees:{" "}
      {interview.otherAttendees
        ?.map((attendee) => {
          return attendee.name
        })
        ?.toString() || "NA"}
    </div>
  )
}

export default Interviews
