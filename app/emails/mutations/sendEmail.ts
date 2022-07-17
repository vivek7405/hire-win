import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Ctx, resolver } from "blitz"
import db from "db"
import { sendCandidateEmailMailer } from "mailers/sendCandidateEmailMailer"
import slugify from "slugify"
import { EmailObj } from "../validations"
import draftToHtml from "draftjs-to-html"

export default resolver.pipe(
  resolver.zod(EmailObj),
  resolver.authorize(),
  async ({ subject, body, cc, candidateId, workflowStageId, templateId }, ctx: Ctx) => {
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
        workflowStageId: workflowStageId || "0",
        senderId: ctx.session.userId || "0",
        templateId,
      },
    })

    return email
  }
)
