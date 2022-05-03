import { resolver, SecurePassword, AuthenticationError } from "blitz"
import db from "db"
import { Login } from "../validations"
import { UserRole } from ".prisma1/client"
import createBaikalUserWithDefaultCalendar from "app/scheduling/mutations/createBaikalUserWithDefaultCalendar"

import { baikalUserDefaultEncryptedPassword } from "app/scheduling/constants"
// import baikalDB from "cal/baikal/db"
import { PrismaClient } from ".prisma2/client"
import addConnectedCalendar from "app/scheduling/calendars/mutations/addConnectedCalendar"
const baikalDB = new PrismaClient()

export const authenticateUser = async (rawEmail: string, rawPassword: string) => {
  const email = rawEmail.toLowerCase().trim()
  const password = rawPassword.trim()
  const user = await db.user.findFirst({ where: { email } })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
  }

  const { hashedPassword, ...rest } = user
  return rest
}

export default resolver.pipe(resolver.zod(Login), async ({ email, password }, ctx) => {
  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)

  const baikalUser = await baikalDB.user.findFirst({ where: { username: Buffer.from(user?.slug) } })
  if (!baikalUser) {
    await createBaikalUserWithDefaultCalendar(
      user?.slug,
      baikalUserDefaultEncryptedPassword,
      user?.email
    )
  }

  await ctx.session.$create({ userId: user.id, role: user.role as UserRole })

  const defaultCalendar = await db.defaultCalendar.findFirst({ where: { userId: user.id } })
  if (!defaultCalendar) {
    await addConnectedCalendar(
      {
        name: "Default",
        type: "CaldavDigest",
        url: `http://localhost:5232/dav.php/calendars/${user?.slug}/default/`,
        username: user?.slug,
        password: "root",
      },
      ctx
    )
  }

  return user
})
