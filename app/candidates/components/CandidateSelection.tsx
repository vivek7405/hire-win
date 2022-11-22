import { BanIcon, ChevronLeftIcon, XCircleIcon } from "@heroicons/react/outline"
import Form from "app/core/components/Form"
import LabeledRatingField from "app/core/components/LabeledRatingField"
import LabeledToggleSwitch from "app/core/components/LabeledToggleSwitch"
import getScoreAverage from "app/score-cards/utils/getScoreAverage"
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
              if (selectedCandidateEmail !== candidate.email) {
                router
                  .replace(
                    Routes.SingleCandidatePage({
                      slug: candidate?.job?.slug,
                      candidateEmail: candidate?.email,
                    })
                  )
                  .then(() => {
                    setSelectedCandidateEmail(candidate.email)
                  })
              }
            }}
            key={candidate.id}
            className={`${
              selectedCandidateEmail === candidate.email ? "bg-neutral-200" : ""
            } px-3 py-1 flex items-center text-neutral-600 cursor-pointer rounded hover:bg-neutral-300 m-1`}
          >
            <div className="w-full flex items-center">
              <div className="w-3/5 pr-5 flex items-center">
                {/* <div className="w-1/6">
                  {selectedCandidateEmail === candidate.email && (
                    <ChevronLeftIcon className={`w-4 h-4`} />
                  )}
                </div> */}
                <div className="w-full truncate">{candidate.name}</div>
              </div>
              <div className="w-2/5 flex justify-end">
                {candidate.rejected ? (
                  <BanIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <Form
                    noFormatting={true}
                    onSubmit={async () => {
                      return
                    }}
                  >
                    <LabeledRatingField
                      name="candidateAverageRating"
                      ratingClass={`!flex items-center`}
                      height={4}
                      color={candidate?.rejected ? "red" : "theme"}
                      value={getScoreAverage(candidate?.scores?.map((score) => score.rating) || [])}
                      disabled={true}
                      allowCursorWhenDisabled={true}
                    />
                  </Form>
                )}
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
  setSelectedCandidateEmail: any
  setOpenNewCandidateModal: any
  canAddNewCandidate: boolean
}
const CandidateSelection = ({
  jobId,
  stageId,
  selectedCandidateEmail,
  setSelectedCandidateEmail,
  setOpenNewCandidateModal,
  canAddNewCandidate,
}: CandidateSelectionPropsType) => {
  const [selectedStageId, setSelectedStageId] = useState(stageId)
  const [viewRejected, setViewRejected] = useState(false)
  //   const [stages] = useQuery(getJobStages, { where: { jobId } })
  //   const [candidates] = useQuery(getAllCandidatesByStage, selectedStageId)

  return (
    <div className="w-full flex flex-col max-h-screen">
      <div
        className={`w-full py-5 px-4 flex items-center ${
          canAddNewCandidate ? "justify-between" : "justify-center"
        } border-b-2 border-theme-400`}
      >
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
        {canAddNewCandidate && (
          <button
            onClick={() => {
              setOpenNewCandidateModal(true)
            }}
            className="px-4 py-1 rounded-lg bg-theme-600 hover:bg-theme-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            New
          </button>
        )}
      </div>
      <div className="w-full flex max-h-full overflow-auto">
        <div className="w-2/5 max-h-full overflow-auto">
          <Suspense fallback={<div className="w-full text-center px-4 py-2">Loading...</div>}>
            <Stages
              jobId={jobId}
              selectedStageId={selectedStageId}
              setSelectedStageId={setSelectedStageId}
              viewRejected={viewRejected}
            />
          </Suspense>
        </div>
        <div className="w-0.5 max-h-full overflow-auto bg-theme-400"></div>
        <div className="w-3/5 max-h-full overflow-auto">
          <Suspense fallback={<div className="w-full text-center px-4 py-2">Loading...</div>}>
            <Candidates
              selectedStageId={selectedStageId}
              selectedCandidateEmail={selectedCandidateEmail}
              setSelectedCandidateEmail={setSelectedCandidateEmail}
              viewRejected={viewRejected}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default CandidateSelection
