import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Ctx, resolver } from "blitz"
import db, { CandidateActivityType, User } from "db"
import { sendCandidateEmailMailer } from "mailers/sendCandidateEmailMailer"
import slugify from "slugify"
import { EmailObj } from "../validations"
import draftToHtml from "draftjs-to-html"

export default resolver.pipe(
  resolver.zod(EmailObj),
  resolver.authorize(),
  async ({ subject, body, cc, candidateId, stageId, templateId }, ctx: Ctx) => {
    if (!body) {
      throw new Error("Email body can't be empty")
    }

    const candidate = await db.candidate.findUnique({ where: { id: candidateId } })
    if (!candidate) {
      throw new Error("No candidate found for the provided id")
    }

    const sender = await db.user.findUnique({ where: { id: ctx.session.userId || "0" } })

    const buildEmail = await sendCandidateEmailMailer({
      candidateEmail: candidate?.email,
      senderName: sender?.name || "",
      subject,
      cc,
      body: draftToHtml(body || {}),
    })
    await buildEmail.send()

    const email = await db.email.create({
      data: {
        subject,
        cc,
        body,
        candidateId: candidateId || "0",
        stageId: stageId || "0",
        senderId: ctx.session.userId || "0",
        templateId,
      },
      include: { stage: true },
    })

    let loggedInUser: User | null = null
    if (ctx?.session?.userId) {
      loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
    }

    await db.candidateActivity.create({
      data: {
        title: `Email sent by ${loggedInUser?.name} in stage "${email?.stage?.name}"`,
        type: CandidateActivityType.Email_Sent,
        performedByUserId: ctx?.session?.userId || "0",
        candidateId: email?.candidateId,
      },
    })

    return email
  }
)
