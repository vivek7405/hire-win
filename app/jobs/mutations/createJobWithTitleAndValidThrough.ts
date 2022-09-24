import { Ctx } from "blitz"
import Guard from "app/guard/ability"
import { EmploymentType } from "@prisma/client"
import createJob from "./createJob"

type JobInput = {
  title: string
  validThrough: Date
}
async function createJobWithTitleAndValidThrough({ title, validThrough }: JobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const description = {
    blocks: [
      {
        key: "8vfl9",
        data: {},
        text: "",
        type: "unstyled",
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
      },
    ],
    entityMap: {},
  }

  const job = await createJob(
    {
      //   hidden: false,

      title,
      remote: false,
      description,
      postToGoogle: false,

      // categoryId: undefined,
      employmentType: [EmploymentType.FULL_TIME],
      validThrough,

      country: "",
      state: "",
      city: "",
    },
    ctx
  )

  return job
}

export default Guard.authorize("create", "job", createJobWithTitleAndValidThrough)