import Guard from "app/guard/ability"
import getCandidatesWOAbility from "./getCandidatesWOAbility"

export default Guard.authorize("readAll", "candidate", getCandidatesWOAbility)
