import { useSession } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { CogIcon } from "@heroicons/react/outline"
import { JobUserRole } from "@prisma/client"
import Link from "next/link"
import toast from "react-hot-toast"
import setCandidateInterviewer from "src/candidates/mutations/setCandidateInterviewer"
import getCandidate from "src/candidates/queries/getCandidate"
import getCandidateInterviewer from "src/candidates/queries/getCandidateInterviewer"
import getJobMembers from "src/jobs/queries/getJobMembers"

type CandidateType = Awaited<ReturnType<typeof getCandidate>>

type StageEvaluatorInput = {
  candidate: CandidateType
  stage: CandidateType["stage"] | null | undefined
}
const StageEvaluator = ({ candidate, stage }: StageEvaluatorInput) => {
  const session = useSession()

  const [selectedStageInterviewer] = useQuery(getCandidateInterviewer, {
    candidateId: candidate?.id || "0",
    stageId: stage?.id || "0",
  })

  const [jobUsers] = useQuery(getJobMembers, { where: { id: candidate.jobId } })
  const [setCandidateInterviewerMutation] = useMutation(setCandidateInterviewer)

  return (
    <>
      <div className="flex items-center justify-center space-x-2">
        <label className="text-neutral-600">Evaluator / Interviewer:</label>
        <select
          className="border border-gray-300 px-2 py-1 block w-32 sm:text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed truncate pr-7"
          name="interviewerId"
          placeholder={`Interviewer for ${stage?.name}`}
          disabled={
            jobUsers?.users?.find((jobUser) => jobUser.userId === session.userId)?.role ===
            JobUserRole.USER
          }
          value={selectedStageInterviewer?.id?.toString()}
          onChange={async (e) => {
            const selectedInterviewerId = e.target.value
            const toastId = toast.loading(() => <span>Updating Interviewer</span>)
            try {
              await setCandidateInterviewerMutation({
                candidateId: candidate?.id || "0",
                stageId: stage?.id || "0",
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
        {!(
          jobUsers?.users?.find((jobUser) => jobUser.userId === session.userId)?.role ===
          JobUserRole.USER
        ) && (
          <Link
            legacyBehavior
            href={Routes.JobSettingsHiringTeamPage({
              slug: candidate?.job?.slug || "0",
            })}
          >
            <a
              title="Go to Hiring Team settings - Add/Edit/Assign Evaluators"
              className="text-theme-600 hover:text-theme-800"
            >
              <CogIcon className="w-5 h-5" />
            </a>
          </Link>
        )}
      </div>
    </>
  )
}

export default StageEvaluator
