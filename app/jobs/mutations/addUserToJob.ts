import { generateToken, hash256, Ctx } from "blitz"
import Guard from "app/guard/ability"
import db, { JobUserRole } from "db"
import { userAddedToJobMailer } from "mailers/userAddedToJobMailer"

interface InviteToJobInput {
  jobId: string
  email: string
}

async function inviteToJob({ jobId, email }: InviteToJobInput, ctx: Ctx) {
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
      role: JobUserRole.USER,
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
    toName: invitee?.user?.name,
    toEmail: invitee?.user?.email,
    addedByUserName: inviter?.user?.name,
    addedByUserEmail: inviter?.user?.email,
    companyName: invitee?.company?.name,
    jobTitle: job?.title,
  })

  await buildEmail.send()

  return createdJobUser
}

export default Guard.authorize("inviteUser", "job", inviteToJob)
