import { NotFoundError, SecurePassword, resolver } from "blitz"
import db from "db"
import { authenticateUser } from "./login"
import { ChangePassword } from "../validations"
import login from "./login"

export default resolver.pipe(
  resolver.zod(ChangePassword),
  resolver.authorize(),
  async ({ currentPassword, newPassword }, ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
    if (!user) throw new NotFoundError()

    try {
      await authenticateUser(user.email, currentPassword)
    } catch (err) {
      throw new Error("Wrong password")
    }

    const hashedPassword = await SecurePassword.hash(newPassword.trim())
    await db.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    })

    await db.session.deleteMany({ where: { userId: user.id } })

    await login({ email: user.email, password: newPassword }, ctx)

    return true
  }
)
