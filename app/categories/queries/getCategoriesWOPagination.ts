import Guard from "app/guard/ability"
import getCategoriesWOPaginationWOAbility from "./getCategoriesWOPaginationWOAbility"

export default Guard.authorize("readAll", "category", getCategoriesWOPaginationWOAbility)
