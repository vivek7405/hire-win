import { generateToken as blitzGenerateToken, hash256, Ctx } from "blitz"
import Guard from "app/guard/ability"
import db from "db"

interface GenerateTokenInput {
  jobId: string
}

const INVITE_TOKEN_EXPIRE_IN_HOURS = 9999

async function generateInviteToJobToken({ jobId }: GenerateTokenInput, ctx: Ctx) {
  ctx.session.$authorize()

  const job = await db.job.findFirst({
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
      type: "PUBLIC_KEY",
    },
  })

  const generatePublicToken = blitzGenerateToken()
  const generatePrivateToken = blitzGenerateToken()

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + INVITE_TOKEN_EXPIRE_IN_HOURS)

  if (!findPastPublicKey) {
    await db.token.create({
      data: {
        type: "PUBLIC_KEY",
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
      type: "SECRET_KEY",
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

export default Guard.authorize("update", "job", generateInviteToJobToken)
