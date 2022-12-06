import Guard from "src/guard/ability"
import getCandidatesWOAbility from "./getCandidatesWOAbility"

export default Guard.authorize("readAll", "candidate", getCandidatesWOAbility)
