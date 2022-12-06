import { resolver } from "@blitzjs/rpc";
import db, { CandidateActivityType, User } from "db"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.string()),
  resolver.authorize(),
  async (emailId, ctx) => {
    const email = await db.email.delete({
      where: { id: emailId },
      include: { stage: true },
    })

    let loggedInUser: User | null = null
    if (ctx?.session?.userId) {
      loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
    }

    await db.candidateActivity.create({
      data: {
        title: `Email deleted by ${loggedInUser?.name} in stage "${email?.stage?.name}"`,
        type: CandidateActivityType.Email_Deleted,
        performedByUserId: ctx?.session?.userId || "0",
        candidateId: email?.candidateId,
      },
    })

    return email
  }
)
