import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateInterviewdetailInput = Pick<Prisma.InterviewDetailUpdateArgs, "where" | "data">

async function updateInterviewDetail({ where, data }: UpdateInterviewdetailInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const interviewDetail = await db.interviewDetail.update({
    where,
    data,
  })

  return interviewDetail
}

export default updateInterviewDetail
