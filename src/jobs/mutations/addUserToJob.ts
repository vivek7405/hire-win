import { generateToken, hash256 } from "@blitzjs/auth"
import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db, { JobUserRole } from "db"
import { userAddedToJobMailer } from "mailers/userAddedToJobMailer"

interface InviteToJobInput {
  jobId: string
  email: string
  jobUserRole: JobUserRole
}

async function inviteToJob({ jobId, email, jobUserRole }: InviteToJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: { email },
  })

  if (!user) return new Error("The user to be added doesn't exist")

  const invitee = await db.companyUser.findFirst({
    where: {
      userId: user?.id,
      companyId: ctx.session.companyId,
    },
    include: { user: true, company: true },
  })

  const inviter = await db.jobUser.findFirst({
    where: {
      userId: ctx.session.userId,
      jobId: jobId,
    },
    include: { user: true },
  })

  const job = await db.job.findFirst({
    where: {
      id: jobId,
    },
    include: {
      users: true,
    },
  })

  if (!invitee) return new Error("The user to be added doesn't exist")
  if (!job) return new Error("No job with the provided id found")
  if (!inviter) return new Error("No inviter found")

  const createdJobUser = await db.jobUser.create({
    data: {
      role: jobUserRole,
      job: {
        connect: {
          id: jobId || "0",
        },
      },
      user: {
        connect: {
          id: invitee?.userId,
        },
      },
    },
  })

  const buildEmail = await userAddedToJobMailer({
    fromEmail: inviter?.user?.name,
    fromName: inviter?.user?.name,
    toEmail: invitee?.user?.email,
    companyName: invitee?.company?.name,
    companySlug: invitee?.company?.slug,
    jobSlug: job?.slug,
    jobTitle: job?.title,
  })

  await buildEmail.send()

  return createdJobUser
}

export default Guard.authorize("inviteUser", "job", inviteToJob)
