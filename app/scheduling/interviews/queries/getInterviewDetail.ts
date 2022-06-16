import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.object({ interviewDetailId: z.string() })),
  async ({ interviewDetailId }) => {
    const interviewDetail = await db.interviewDetail.findUnique({
      where: {
        id: interviewDetailId,
      },
      include: {
        interviewer: { include: { calendars: true } },
      },
    })

    return interviewDetail
  }
)
