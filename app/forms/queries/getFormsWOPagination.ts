import Guard from "app/guard/ability"
import getFormsWOPaginationWOAbility from "./getFormsWOPaginationWOAbility"

export default Guard.authorize("readAll", "form", getFormsWOPaginationWOAbility)
