import Guard from "app/guard/ability"
import getJob from "./getJob"

export default Guard.authorize("read", "job", getJob)
