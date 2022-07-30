import { resolver, SecurePassword, Ctx, generateToken, hash256 } from "blitz"
import db, { UserRole } from "db"
import { adminNewUserMailer } from "mailers/adminNewUserMailer"
import crypto from "crypto"

const generatePassword = (
  length = 20,
  wishlist = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$"
) =>
  Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => wishlist[x % wishlist.length])
    .join("")

const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4
export default resolver.pipe(
  resolver.authorize(UserRole.ADMIN),
  async ({ name, email }: any, ctx: Ctx) => {
    // 1. Create User
    const hashedPassword = await SecurePassword.hash(generatePassword().trim())
    const user = await db.user.create({
      data: {
        name: name,
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: UserRole.USER,
      },
      select: { id: true, email: true, role: true },
    })

    // 2. Generate token
    const token = generateToken()
    const hashedToken = hash256(token)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS)

    // 3. If user is created, create a token and send email to user for them to change their password
    if (user) {
      // Delete any existing password reset tokens
      await db.token.deleteMany({ where: { type: "RESET_PASSWORD", userId: user.id } })
      // Save this new token in the database.
      await db.token.create({
        data: {
          user: { connect: { id: user.id } },
          type: "RESET_PASSWORD",
          expiresAt,
          hashedToken,
          sentTo: user.email,
        },
      })
      //  Send the email
      await adminNewUserMailer({ to: user.email, token }).send()
    } else {
      // If no user created wait the same time so attackers can't tell the difference
      await new Promise((resolve) => setTimeout(resolve, 750))
    }

    return user
  }
)
