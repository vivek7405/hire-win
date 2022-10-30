import { BanIcon, ChevronLeftIcon, XCircleIcon } from "@heroicons/react/outline"
import Form from "app/core/components/Form"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import getJobStages from "app/stages/queries/getJobStages"
import { invalidateQuery, Routes, useQuery, useRouter } from "blitz"
import { Suspense, useState } from "react"
import getAllCandidatesByStage from "../queries/getAllCandidatesByStage"
import getCandidate from "../queries/getCandidate"

type StagesPropsType = {
  jobId: string
  selectedStageId: string
  setSelectedStageId: any
  viewRejected: boolean
}
const Stages = ({ jobId, selectedStageId, setSelectedStageId, viewRejected }: StagesPropsType) => {
  const [stages] = useQuery(getJobStages, {
    where: { jobId },
    orderBy: { order: "asc" },
  })

  return (
    <>
      {stages?.map((stage) => {
        return (
          <div
            onClick={() => {
              setSelectedStageId(stage.id)
            }}
            key={stage.id}
            className={`${
              selectedStageId === stage.id ? "bg-neutral-200" : ""
            } px-3 py-1 flex items-center justify-between text-neutral-600 cursor-pointer rounded hover:bg-neutral-300 m-1`}
          >
            {/* <div className="w-full flex items-center truncate">
                <div className="w-1/6">
                  {selectedStageId === stage.id && <ChevronLeftIcon className={`w-4 h-4`} />}
                </div>
                <div className="w-5/6 truncate mx-2">{stage.name}</div>
              </div> */}
            <div className="truncate mr-2">{stage.name}</div>
            <div>{stage.candidates?.filter((c) => c.rejected === viewRejected)?.length || 0}</div>
          </div>
        )
      })}
    </>
  )
}

type CandidatesPropsType = {
  selectedStageId: string
  selectedCandidateEmail: string
  setSelectedCandidateEmail: any
  viewRejected: boolean
}
const Candidates = ({
  selectedStageId,
  selectedCandidateEmail,
  setSelectedCandidateEmail,
  viewRejected,
}: CandidatesPropsType) => {
  const [candidates] = useQuery(getAllCandidatesByStage, {
    stageId: selectedStageId,
    rejected: viewRejected,
  })
  const router = useRouter()

  return (
    <>
      {candidates?.length === 0 && (
        <div className="flex flex-col py-6 px-4 space-y-1 items-center justify-center">
          <XCircleIcon className="w-6 h-6 text-neutral-600" />
          <div className="text-center my-2 text-neutral-600">{`No ${
            viewRejected ? "rejected" : ""
          } Candidates in this stage`}</div>
        </div>
      )}
      {candidates?.map((candidate) => {
        return (
          <div
            onClick={() => {
              setSelectedCandidateEmail(candidate.email)
              if (selectedCandidateEmail !== candidate.email) {
                router.replace(
                  Routes.SingleCandidatePage({
                    slug: candidate?.job?.slug,
                    candidateEmail: candidate?.email,
                  })
                )
              }
            }}
            key={candidate.id}
            className={`${
              selectedCandidateEmail === candidate.email ? "bg-neutral-200" : ""
            } px-3 py-1 flex items-center text-neutral-600 cursor-pointer rounded hover:bg-neutral-300 m-1`}
          >
            <div className="w-full flex items-center">
              <div className="w-5/6 flex items-center">
                <div className="w-1/6">
                  {selectedCandidateEmail === candidate.email && (
                    <ChevronLeftIcon className={`w-4 h-4`} />
                  )}
                </div>
                <div className="w-5/6 truncate">{candidate.name}</div>
              </div>
              <div className="w-1/6">
                {candidate.rejected && <BanIcon className="w-5 h-5 text-red-600" />}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

type CandidateSelectionPropsType = {
  jobId: string
  stageId: string
  selectedCandidateEmail: string
  setViewCandidateSelection: any
  setSelectedCandidateEmail: any
}
const CandidateSelection = ({
  jobId,
  stageId,
  selectedCandidateEmail,
  setViewCandidateSelection,
  setSelectedCandidateEmail,
}: CandidateSelectionPropsType) => {
  const [selectedStageId, setSelectedStageId] = useState(stageId)
  const [viewRejected, setViewRejected] = useState(false)
  //   const [stages] = useQuery(getJobStages, { where: { jobId } })
  //   const [candidates] = useQuery(getAllCandidatesByStage, selectedStageId)

  return (
    <div className="w-full h-full flex flex-col border-2 rounded-lg border-theme-400 bg-white">
      <div className="w-full py-2 flex items-center justify-center border-b-2 border-theme-400">
        <Form noFormatting={true} onSubmit={async () => {}}>
          <LabeledToggleSwitch
            name="rejected"
            label="View Rejected"
            flex={true}
            onChange={() => {
              setViewRejected(!viewRejected)
            }}
          />
        </Form>
      </div>
      <div className="w-full h-full flex">
        <div className="w-3/5 border-r-2 border-theme-400">
          <Suspense fallback="Loading...">
            <Candidates
              selectedStageId={selectedStageId}
              selectedCandidateEmail={selectedCandidateEmail}
              setSelectedCandidateEmail={setSelectedCandidateEmail}
              viewRejected={viewRejected}
            />
          </Suspense>
        </div>
        <div className="w-2/5 flex flex-col">
          <Suspense fallback="Loading...">
            <Stages
              jobId={jobId}
              selectedStageId={selectedStageId}
              setSelectedStageId={setSelectedStageId}
              viewRejected={viewRejected}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default CandidateSelection
