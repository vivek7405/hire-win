import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import { EmploymentType, RemoteOption } from "@prisma/client"
import createJob from "./createJob"

type JobInput = {
  title: string
  // validThrough: Date
}
async function createJobWithTitle({ title }: JobInput, ctx: Ctx) {
  ctx.session.$authorize()

  // const description = {
  //   blocks: [
  //     {
  //       key: "8vfl9",
  //       data: {},
  //       text: "",
  //       type: "unstyled",
  //       depth: 0,
  //       entityRanges: [],
  //       inlineStyleRanges: [],
  //     },
  //   ],
  //   entityMap: {},
  // }

  const job = await createJob(
    {
      //   hidden: false,
      title,
      remoteOption: RemoteOption.No_Remote,
      description: "",
      postToGoogle: false,
      // categoryId: undefined,
      employmentType: [EmploymentType.FULL_TIME],
      // validThrough,
      country: "",
      state: "",
      city: "",
    },
    ctx
  )

  return job
}

export default Guard.authorize("create", "job", createJobWithTitle)
