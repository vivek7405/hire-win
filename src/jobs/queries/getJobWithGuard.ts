import Guard from "src/guard/ability"
import getJob from "./getJob"

export default Guard.authorize("read", "job", getJob)
