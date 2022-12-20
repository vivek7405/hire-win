import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { TrashIcon, XIcon } from "@heroicons/react/outline"
import { Interview, JobUser, JobUserRole, User } from "@prisma/client"
import Confirm from "src/core/components/Confirm"
import Modal from "src/core/components/Modal"
import setCandidateInterviewer from "src/candidates/mutations/setCandidateInterviewer"
import getCandidateInterviewer from "src/candidates/queries/getCandidateInterviewer"
import getJobMembers from "src/jobs/queries/getJobMembers"
import moment from "moment"
import { Suspense, useState } from "react"
import toast from "react-hot-toast"
import cancelInterview from "../mutations/cancelInterview"
import getCandidateInterviewsByStage from "../queries/getCandidateInterviewsByStage"
import ScheduleInterview from "./ScheduleInterview"
import getStage from "src/stages/queries/getStage"
import getCandidate from "src/candidates/queries/getCandidate"

const Interviews = ({ user, stageId, candidate, activePlanName }) => {
  const [openScheduleInterviewModal, setOpenScheduleInterviewModal] = useState(false)
  const [cancelInterviewMutation] = useMutation(cancelInterview)
  const [interviewToDelete, setInterviewToDelete] = useState(null as any as Interview)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [candidateStageInterviews] = useQuery(getCandidateInterviewsByStage, {
    candidateId: candidate?.id || "0",
    stageId: stageId || "0",
  })
  const [stage] = useQuery(getStage, { where: { id: stageId || "0" } })

  const session = useSession()
  const [jobUsers] = useQuery(getJobMembers, { where: { id: candidate.jobId } })
  const [setCandidateInterviewerMutation] = useMutation(setCandidateInterviewer)

  const [interviewer] = useQuery(getCandidateInterviewer, {
    candidateId: candidate?.id || "0",
    stageId: stageId || "0",
  })

  return (
    <>
      <Modal
        header="Schedule Interview"
        open={openScheduleInterviewModal}
        setOpen={setOpenScheduleInterviewModal}
      >
        <Suspense fallback="Loading...">
          <ScheduleInterview
            // interviewDetail={interviewDetail!}
            interviewer={interviewer}
            stageId={stageId || "0"}
            candidateId={candidate?.id || "0"}
            setOpenScheduleInterviewModal={setOpenScheduleInterviewModal}
            activePlanName={activePlanName}
          />
        </Suspense>
      </Modal>

      <Confirm
        open={openConfirm}
        setOpen={setOpenConfirm}
        header="Cancel Interview"
        onSuccess={async () => {
          const toastId = toast.loading("Cancelling interview")
          try {
            await cancelInterviewMutation({
              interviewId: interviewToDelete?.id || "0",
              cancelCode: interviewToDelete?.cancelCode,
              skipCancelCodeVerification: true,
            })
            toast.success("Interview cancelled", { id: toastId })
            setOpenConfirm(false)
            invalidateQuery(getCandidateInterviewsByStage)
            invalidateQuery(getCandidate)
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
        <div className="flex items-center justify-center space-x-2">
          <label className="text-neutral-600">Interviewer:</label>
          <select
            className="border border-gray-300 px-2 py-1 block w-32 sm:text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed truncate pr-7"
            name="interviewerId"
            placeholder={`Interviewer for ${stage?.name}`}
            disabled={
              jobUsers?.users?.find((jobUser) => jobUser.userId === session.userId)?.role ===
              JobUserRole.USER
            }
            value={interviewer?.id?.toString()}
            onChange={async (e) => {
              const selectedInterviewerId = e.target.value
              const toastId = toast.loading(() => <span>Updating Interviewer</span>)
              try {
                await setCandidateInterviewerMutation({
                  candidateId: candidate?.id,
                  stageId: stageId || "0",
                  interviewerId: selectedInterviewerId || "0",
                })

                await invalidateQuery(getCandidateInterviewer)
                await invalidateQuery(getCandidate)

                toast.success(() => <span>Interviewer assigned to candidate stage</span>, {
                  id: toastId,
                })
              } catch (error) {
                toast.error(
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString()
                )
              }
            }}
          >
            {jobUsers?.users.map((jobUser) => {
              return (
                <option key={jobUser?.userId?.toString()!} value={jobUser?.userId?.toString()!}>
                  {jobUser?.user?.name!}
                </option>
              )
            })}
          </select>
        </div>
        <div className="flex items-center mt-6">
          <div className="font-bold text-lg w-full">Interviews</div>
          <button
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-end text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
            disabled={
              // selectedWorkflowStage?.interviewDetails?.find(
              //   (int) => int.jobId === candidate?.jobId && int.interviewerId === user?.id
              // )?.interviewerId !== user?.id &&
              interviewer?.id !== user?.id &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !== "OWNER" &&
              user?.jobs?.find((jobUser) => jobUser.jobId === candidate?.jobId)?.role !== "ADMIN"
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
            ?.filter(
              (interview) =>
                !interview.cancelled &&
                moment.utc(interview.startDateUTC).local().toDate() <= new Date() &&
                new Date() <=
                  moment
                    .utc(interview.startDateUTC)
                    .local()
                    .add(interview.duration, "minutes")
                    .toDate()
            )
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Ongoing</span>}
                  <CandidateInterview
                    key={interview.id}
                    type={CandidateInterviewType.ONGOING}
                    interview={interview}
                    user={user as any}
                    setOpenConfirm={setOpenConfirm}
                    setInterviewToDelete={setInterviewToDelete}
                  />
                </>
              )
            })}
          {candidateStageInterviews
            ?.filter(
              (interview) =>
                !interview.cancelled &&
                moment.utc(interview.startDateUTC).local().toDate() > new Date()
            )
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Upcoming</span>}
                  <CandidateInterview
                    key={interview.id}
                    type={CandidateInterviewType.UPCOMING}
                    interview={interview}
                    user={user as any}
                    setOpenConfirm={setOpenConfirm}
                    setInterviewToDelete={setInterviewToDelete}
                  />
                </>
              )
            })}
          {candidateStageInterviews
            ?.filter(
              (interview) =>
                !interview.cancelled &&
                moment.utc(interview.startDateUTC).local().toDate() < new Date()
            )
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Past</span>}
                  <CandidateInterview
                    key={interview.id}
                    type={CandidateInterviewType.PAST}
                    interview={interview}
                    user={user as any}
                    setOpenConfirm={setOpenConfirm}
                    setInterviewToDelete={setInterviewToDelete}
                  />
                </>
              )
            })}
          {candidateStageInterviews
            ?.filter((interview) => interview.cancelled)
            .map((interview, index) => {
              return (
                <>
                  {index === 0 && <span className="font-semibold">Cancelled</span>}
                  <CandidateInterview
                    key={interview.id}
                    type={CandidateInterviewType.CANCELLED}
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

enum CandidateInterviewType {
  ONGOING = "ONGOING",
  UPCOMING = "UPCOMING",
  PAST = "PAST",
  CANCELLED = "CANCELLED",
}

type CandidateInterviewProps = {
  type: CandidateInterviewType
  interview: Interview & { organizer: User } & { interviewer: User } & {
    otherAttendees: User[]
  }
  user: User & { jobUsers: JobUser[] }
  setOpenConfirm: any
  setInterviewToDelete: any
}
const CandidateInterview = ({
  type,
  interview,
  user,
  setOpenConfirm,
  setInterviewToDelete,
}: CandidateInterviewProps) => {
  return (
    <div key={interview.id} className="w-full p-3 bg-neutral-50 border-2 rounded">
      {type !== CandidateInterviewType.CANCELLED && (
        <button
          title="Cancel Interview"
          className="float-right disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            user?.id !== interview?.interviewerId &&
            user?.id !== interview?.organizerId &&
            user?.jobUsers?.find((JobUser) => JobUser.jobId === interview?.jobId)?.role !== "OWNER"
          }
          onClick={() => {
            setOpenConfirm(true)
            setInterviewToDelete(interview)
          }}
        >
          <XIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
        </button>
      )}
      {type !== CandidateInterviewType.CANCELLED && (
        <>
          <b className="capitalize">
            {type === CandidateInterviewType.ONGOING && "Started"}{" "}
            {type === CandidateInterviewType.PAST && "Happened"}{" "}
            {moment(interview.startDateUTC).local().fromNow()}
          </b>
          <br />
        </>
      )}
      {moment(interview.startDateUTC).local().toLocaleString()}
      <br />
      {interview.meetingLink && (
        <>
          <br />
          <a
            className="text-indigo-600"
            href={interview.meetingLink}
            target="_blank"
            rel="noreferrer"
          >
            {interview.meetingLink}
          </a>
        </>
      )}
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
      {type !== CandidateInterviewType.CANCELLED && interview.calendarLink && (
        <>
          <br />
          <a
            className="text-indigo-600"
            href={interview.calendarLink}
            target="_blank"
            rel="noreferrer"
          >
            View in calendar
          </a>
        </>
      )}
      {/* <br />
      <a className="text-indigo-600" href={interview.cancelCode}>
        Cancel
      </a> */}
    </div>
  )
}

export default Interviews
