import Guard from "app/guard/ability"
import getScoreCardsWOPaginationWOAbility from "./getScoreCardsWOPaginationWOAbility"

export default Guard.authorize("readAll", "scoreCard", getScoreCardsWOPaginationWOAbility)
