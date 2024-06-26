import { generateToken, hash256 } from "@blitzjs/auth"
import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db, { TokenType } from "db"

interface GenerateTokenInput {
  companyId: string
}

const INVITE_TOKEN_EXPIRE_IN_HOURS = 9999

async function generateInviteToCompanyToken({ companyId }: GenerateTokenInput, ctx: Ctx) {
  ctx.session.$authorize()

  const company = await db.company.findFirst({
    where: {
      id: companyId,
    },
    include: {
      users: true,
    },
  })

  if (!company) return new Error("No company selected")

  const findPastPublicKey = await db.token.findFirst({
    where: {
      companyId: companyId,
      type: TokenType.PUBLIC_KEY,
    },
  })

  const generatePublicToken = generateToken()
  const generatePrivateToken = generateToken()

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + INVITE_TOKEN_EXPIRE_IN_HOURS)

  if (!findPastPublicKey) {
    await db.token.create({
      data: {
        type: TokenType.PUBLIC_KEY,
        hashedToken: generatePublicToken,
        expiresAt,
        user: {
          connect: {
            id: ctx.session.userId,
          },
        },
        company: {
          connect: {
            id: company.id,
          },
        },
      },
    })
  }

  await db.token.create({
    data: {
      type: TokenType.SECRET_KEY,
      hashedToken: hash256(generatePrivateToken),
      lastFour: `${generatePrivateToken
        .split("")
        .splice(generatePrivateToken.length - 4, generatePrivateToken.length)
        .join("")}`,
      expiresAt,
      user: {
        connect: {
          id: ctx.session.userId,
        },
      },
      company: {
        connect: {
          id: company.id,
        },
      },
    },
  })

  return generatePrivateToken
}

export default Guard.authorize("update", "company", generateInviteToCompanyToken)
