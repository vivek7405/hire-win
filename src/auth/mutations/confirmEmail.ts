import { resolver } from "@blitzjs/rpc";
import { generateToken, hash256 } from "@blitzjs/auth";
import { Ctx } from "blitz";
import db from "db"
import { confirmEmailMailer } from "mailers/confirmEmailMailer"
import { z } from "zod"

async function confirmEmail({ email }, ctx: Ctx) {
  if (!email) return new Error("Not a valid email")

  const existingUser = await db.user.findFirst({ where: { email } })

  if (existingUser) {
    throw new Error("This email is already being used")
  }

  const token = generateToken()
  const hashedToken = hash256(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 2)

  await db.token.create({
    data: {
      type: "CONFIRM_EMAIL",
      expiresAt,
      hashedToken,
      sentTo: email,
    },
  })

  const buildEmail = await confirmEmailMailer({ to: email, token })

  await buildEmail.send()

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/signup?token=${token}`
}

export default resolver.pipe(resolver.zod(z.object({ email: z.string().email() })), confirmEmail)
