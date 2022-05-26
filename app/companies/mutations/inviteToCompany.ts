import { generateToken, hash256, Ctx } from "blitz"
import Guard from "app/guard/ability"
import db from "db"
import { inviteToCompanyMailer } from "mailers/inviteToCompanyMailer"

interface InviteToCompanyInput {
  companyId: number
  email: string
}

async function inviteToCompany({ companyId, email }: InviteToCompanyInput, ctx: Ctx) {
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
      user: { connect: { id: inviter.userId } },
      type: "INVITE_TO_COMPANY_TOKEN",
      expiresAt,
      hashedToken,
      sentTo: email,
    },
  })

  const buildEmail = await inviteToCompanyMailer({ to: email, token, companyId })

  await buildEmail.send()

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/invitations/company/accept?token=${token}&companyId=${company?.id}`
}

export default Guard.authorize("inviteUser", "company", inviteToCompany)
