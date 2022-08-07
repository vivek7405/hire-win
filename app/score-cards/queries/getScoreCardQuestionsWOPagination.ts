import Guard from "app/guard/ability"
import getScoreCardQuestionsWOPaginationWOAbility from "./getScoreCardQuestionsWOPaginationWOAbility"

export default Guard.authorize(
  "readAll",
  "scoreCardQuestion",
  getScoreCardQuestionsWOPaginationWOAbility
)
