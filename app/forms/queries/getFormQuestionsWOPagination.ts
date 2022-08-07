import Guard from "app/guard/ability"
import getFormQuestionsWOPaginationWOAbility from "./getFormQuestionsWOPaginationWOAbility"

export default Guard.authorize("readAll", "formQuestion", getFormQuestionsWOPaginationWOAbility)
