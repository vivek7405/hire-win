import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateInterviewdetailInput = Pick<Prisma.InterviewDetailUpdateArgs, "where" | "data">

async function updateInterviewdetail({ where, data }: UpdateInterviewdetailInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const interviewdetail = await db.interviewDetail.update({
    where,
    data,
  })

  return interviewdetail
}

export default updateInterviewdetail
