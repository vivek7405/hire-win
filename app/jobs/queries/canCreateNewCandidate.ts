import Guard from "app/guard/ability"
import { Ctx } from "blitz"

type CanCreateNewCandidateInput = {
  jobId: string
}
export default async function canCreateNewCandidate(
  { jobId }: CanCreateNewCandidateInput,
  ctx: Ctx
) {
  const { can: canCreate } = await Guard.can("create", "candidate", { ...ctx }, { jobId })

  return canCreate
}
