import { generateToken, hash256, Ctx } from "blitz"
import Guard from "app/guard/ability"
import db from "db"
import { inviteToJobMailer } from "mailers/inviteToJobMailer"

interface InviteToJobInput {
  jobId: string
  email: string
}

async function inviteToJob({ jobId, email }: InviteToJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const inviter = await db.jobUser.findFirst({
    where: {
      userId: ctx.session.userId,
      jobId: jobId,
    },
  })

  const job = await db.job.findFirst({
    where: {
      id: jobId,
    },
    include: {
      users: true,
    },
  })

  if (!job || !inviter) return new Error("No job or inviter selected")

  const token = generateToken()
  const hashedToken = hash256(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 2)

  await db.token.create({
    data: {
      userId: inviter.userId,
      type: "INVITE_TO_JOB",
      expiresAt,
      hashedToken,
      sentTo: email,
      jobId: jobId || "0",
    },
  })

  const buildEmail = await inviteToJobMailer({ to: email, token, jobId })

  await buildEmail.send()

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/invitations/job/accept?token=${token}&jobId=${job?.id}`
}

export default Guard.authorize("inviteUser", "job", inviteToJob)
