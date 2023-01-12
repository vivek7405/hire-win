import { generateToken, hash256 } from "@blitzjs/auth"
import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db, { TokenType } from "db"

interface GenerateTokenInput {
  jobId: string
}

const INVITE_TOKEN_EXPIRE_IN_HOURS = 9999

async function generateInviteToJobToken({ jobId }: GenerateTokenInput, ctx: Ctx) {
  ctx.session.$authorize()

  const job = await db.job.findUnique({
    where: {
      id: jobId,
    },
    include: {
      users: true,
    },
  })

  if (!job) return new Error("No job selected")

  const findPastPublicKey = await db.token.findFirst({
    where: {
      jobId: jobId,
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
        job: {
          connect: {
            id: job.id,
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
      job: {
        connect: {
          id: job.id,
        },
      },
    },
  })

  return generatePrivateToken
}

export default generateInviteToJobToken
// export default Guard.authorize("update", "job", generateInviteToJobToken)
