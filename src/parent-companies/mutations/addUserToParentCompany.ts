import { generateToken, hash256 } from "@blitzjs/auth"
import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db, { ParentCompanyUserRole } from "db"
// import { userAddedToParentCompanyMailer } from "mailers/userAddedToParentCompanyMailer"

interface InviteToParentCompanyInput {
  parentCompanyId: string
  email: string
  parentCompanyUserRole: ParentCompanyUserRole
}

async function addUserToParentCompany(
  { parentCompanyId, email, parentCompanyUserRole }: InviteToParentCompanyInput,
  ctx: Ctx
) {
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

  const inviter = await db.parentCompanyUser.findFirst({
    where: {
      userId: ctx.session.userId,
      parentCompanyId: parentCompanyId,
    },
    include: { user: true },
  })

  const parentCompany = await db.parentCompany.findFirst({
    where: {
      id: parentCompanyId,
    },
    include: {
      users: true,
    },
  })

  if (!invitee) return new Error("The user to be added doesn't exist")
  if (!parentCompany) return new Error("No parent company with the provided id found")
  if (!inviter) return new Error("No inviter found")

  const createdParentCompanyUser = await db.parentCompanyUser.create({
    data: {
      role: parentCompanyUserRole,
      parentCompanyId: parentCompanyId || "0",
      userId: invitee?.userId || "0",
    },
  })

  //   const buildEmail = await userAddedToParentCompanyMailer({
  //     fromEmail: inviter?.user?.name,
  //     fromName: inviter?.user?.name,
  //     toEmail: invitee?.user?.email,
  //     companyName: invitee?.company?.name,
  //     companySlug: invitee?.company?.slug,
  //     parentCompanySlug: parentCompany?.slug,
  //     parentCompanyTitle: parentCompany?.title,
  //   })
  //   await buildEmail.send()

  return createdParentCompanyUser
}

export default Guard.authorize("access", "parentCompanySettings", addUserToParentCompany)
