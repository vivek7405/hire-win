import { generateToken, hash256 } from "@blitzjs/auth";
import { Ctx } from "blitz";
import Guard from "src/guard/ability"
import db, { CompanyUserRole } from "db"
import { inviteToCompanyMailer } from "mailers/inviteToCompanyMailer"

interface InviteToCompanyInput {
  companyId: string
  email: string
  companyUserRole: CompanyUserRole
}

async function inviteToCompany(
  { companyId, email, companyUserRole }: InviteToCompanyInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const inviter = await db.companyUser.findFirst({
    where: {
      userId: ctx.session.userId,
      companyId: companyId,
    },
  })

  const company = await db.company.findFirst({
    where: {
      id: companyId,
    },
    include: {
      users: true,
    },
  })

  if (!company || !inviter) return new Error("No company or inviter selected")

  const token = generateToken()
  const hashedToken = hash256(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 2)

  await db.token.create({
    data: {
      userId: inviter.userId,
      type: "INVITE_TO_COMPANY",
      expiresAt,
      hashedToken,
      sentTo: email,
      companyId: companyId || "0",
      companyUserRole,
    },
  })

  const buildEmail = await inviteToCompanyMailer({ to: email, token, companyId })

  await buildEmail.send()

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/invitations/company/accept?token=${token}`
}

export default Guard.authorize("inviteUser", "company", inviteToCompany)