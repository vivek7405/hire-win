import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateInterviewInput = Pick<Prisma.InterviewUpdateArgs, "where" | "data">

async function updateInterview({ where, data }: UpdateInterviewInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const interview = await db.interview.update({
    where,
    data,
  })

  return interview
}

export default updateInterview
